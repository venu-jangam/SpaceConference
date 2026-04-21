const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const upload = multer({ storage: multer.memoryStorage() });

// ============================================================
// GET /api/conferences — List with filters, search, sort
// ============================================================
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      organizer,
      region,
      format,
      topics,
      status,
      date_from,
      date_to,
      fee_min,
      fee_max,
      bursary,
      sort = 'soonest',
      page = 1,
      limit = 20,
    } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Full-text search
    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR organizer ILIKE $${paramIndex} OR array_to_string(topics, ',') ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Organizer filter
    if (organizer) {
      const orgs = organizer.split(',');
      const orgConditions = orgs.map((_, i) => `organizer ILIKE $${paramIndex + i}`);
      conditions.push(`(${orgConditions.join(' OR ')})`);
      orgs.forEach(o => params.push(`%${o.trim()}%`));
      paramIndex += orgs.length;
    }

    // Region filter
    if (region) {
      const regions = region.split(',');
      const placeholders = regions.map((_, i) => `$${paramIndex + i}`);
      conditions.push(`region IN (${placeholders.join(',')})`);
      regions.forEach(r => params.push(r.trim()));
      paramIndex += regions.length;
    }

    // Format filter
    if (format) {
      conditions.push(`format = $${paramIndex}`);
      params.push(format);
      paramIndex++;
    }

    // Topics filter (multi-select)
    if (topics) {
      const topicArr = topics.split(',').map(t => t.trim());
      conditions.push(`topics && $${paramIndex}::text[]`);
      params.push(topicArr);
      paramIndex++;
    }

    // Status filter
    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Date range
    if (date_from) {
      conditions.push(`start_date >= $${paramIndex}`);
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      conditions.push(`end_date <= $${paramIndex}`);
      params.push(date_to);
      paramIndex++;
    }

    // Fee range
    if (fee_min) {
      conditions.push(`regular_fee >= $${paramIndex}`);
      params.push(fee_min);
      paramIndex++;
    }
    if (fee_max) {
      conditions.push(`regular_fee <= $${paramIndex}`);
      params.push(fee_max);
      paramIndex++;
    }

    // Student bursary toggle
    if (bursary === 'true') {
      conditions.push('student_bursary_available = TRUE');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sort
    let orderClause;
    switch (sort) {
      case 'registration_deadline':
        orderClause = 'ORDER BY registration_deadline ASC NULLS LAST';
        break;
      case 'abstract_deadline':
        orderClause = 'ORDER BY abstract_deadline ASC NULLS LAST';
        break;
      case 'recently_added':
        orderClause = 'ORDER BY created_at DESC';
        break;
      case 'soonest':
      default:
        orderClause = 'ORDER BY start_date ASC';
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Count total
    const countQuery = `SELECT COUNT(*) FROM conferences ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Main query
    let selectFields = 'c.*';
    let joinClause = '';
    
    // If user is authenticated, include saved status
    if (req.user) {
      selectFields += `, CASE WHEN sc.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_saved`;
      joinClause = `LEFT JOIN saved_conferences sc ON c.id = sc.conference_id AND sc.user_id = '${req.user.id}'`;
    }

    const query = `
      SELECT ${selectFields}
      FROM conferences c
      ${joinClause}
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    res.json({
      conferences: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching conferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/conferences/upcoming — Next 3 upcoming for countdown
// ============================================================
router.get('/upcoming', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM conferences 
       WHERE start_date > CURRENT_DATE AND status != 'past'
       ORDER BY start_date ASC
       LIMIT 3`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/conferences/stats — Stats for admin dashboard
// ============================================================
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_conferences,
        COUNT(*) FILTER (WHERE status = 'upcoming') as upcoming,
        COUNT(*) FILTER (WHERE status = 'registration_open') as registration_open,
        COUNT(*) FILTER (WHERE status = 'abstract_open') as abstract_open,
        COUNT(*) FILTER (WHERE status = 'ongoing') as ongoing,
        COUNT(*) FILTER (WHERE status = 'past') as past,
        COUNT(*) FILTER (WHERE is_verified = TRUE) as verified,
        COUNT(*) FILTER (WHERE is_verified = FALSE) as unverified
      FROM conferences
    `);

    const userCount = await db.query('SELECT COUNT(*) FROM users');
    
    const mostSaved = await db.query(`
      SELECT c.id, c.name, c.slug, COUNT(sc.id) as save_count
      FROM conferences c
      LEFT JOIN saved_conferences sc ON c.id = sc.conference_id
      GROUP BY c.id, c.name, c.slug
      ORDER BY save_count DESC
      LIMIT 10
    `);

    res.json({
      ...stats.rows[0],
      total_users: parseInt(userCount.rows[0].count),
      most_saved: mostSaved.rows,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/conferences/:slug — Single conference detail
// ============================================================
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    let selectFields = 'c.*';
    let joinClause = '';

    if (req.user) {
      selectFields += `, CASE WHEN sc.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_saved`;
      joinClause = `LEFT JOIN saved_conferences sc ON c.id = sc.conference_id AND sc.user_id = '${req.user.id}'`;
    }

    const result = await db.query(
      `SELECT ${selectFields} FROM conferences c ${joinClause} WHERE c.slug = $1`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    // Get save count
    const saveCount = await db.query(
      'SELECT COUNT(*) FROM saved_conferences WHERE conference_id = $1',
      [result.rows[0].id]
    );

    res.json({
      ...result.rows[0],
      save_count: parseInt(saveCount.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching conference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/conferences — Create (Admin only)
// ============================================================
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name, organizer, description, start_date, end_date,
      abstract_deadline, early_bird_deadline, registration_deadline,
      city, country, venue, region, format, website_url,
      registration_url, abstract_url, student_fee, regular_fee,
      currency, travel_grants_available, student_bursary_available,
      bursary_details, topics, status, latitude, longitude
    } = req.body;

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 200);

    const result = await db.query(
      `INSERT INTO conferences (
        name, slug, organizer, description, start_date, end_date,
        abstract_deadline, early_bird_deadline, registration_deadline,
        city, country, venue, region, format, website_url,
        registration_url, abstract_url, student_fee, regular_fee,
        currency, travel_grants_available, student_bursary_available,
        bursary_details, topics, status, is_verified, source, latitude, longitude
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, TRUE, 'manual', $26, $27
      ) RETURNING *`,
      [
        name, slug, organizer, description, start_date, end_date,
        abstract_deadline, early_bird_deadline, registration_deadline,
        city, country, venue, region, format, website_url,
        registration_url, abstract_url, student_fee, regular_fee,
        currency || 'USD', travel_grants_available || false, student_bursary_available || false,
        bursary_details, topics || [], status || 'upcoming', latitude, longitude
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating conference:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Conference with this name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// PATCH /api/conferences/:id — Update (Admin only)
// ============================================================
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const fields = req.body;
    const sets = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (key === 'id' || key === 'created_at') continue;
      sets.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const result = await db.query(
      `UPDATE conferences SET ${sets.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating conference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// DELETE /api/conferences/:id — Delete (Admin only)
// ============================================================
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM conferences WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    res.json({ message: 'Conference deleted successfully' });
  } catch (error) {
    console.error('Error deleting conference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/conferences/:id/verify — Verify conference (Admin)
// ============================================================
router.post('/:id/verify', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE conferences SET is_verified = TRUE WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error verifying conference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/conferences/import — Bulk CSV import (Admin)
// ============================================================
router.post('/import', authenticate, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let imported = 0;
    let errors = [];

    for (const record of records) {
      try {
        const slug = record.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .substring(0, 200);

        const topics = record.topics ? record.topics.split(';').map(t => t.trim()) : [];

        await db.query(
          `INSERT INTO conferences (
            name, slug, organizer, description, start_date, end_date,
            abstract_deadline, early_bird_deadline, registration_deadline,
            city, country, venue, region, format, website_url,
            student_fee, regular_fee, currency, travel_grants_available,
            student_bursary_available, topics, status, is_verified, source
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21, $22, FALSE, 'csv_import'
          ) ON CONFLICT (slug) DO NOTHING`,
          [
            record.name, slug, record.organizer, record.description,
            record.start_date, record.end_date, record.abstract_deadline || null,
            record.early_bird_deadline || null, record.registration_deadline || null,
            record.city, record.country, record.venue, record.region, record.format,
            record.website_url, record.student_fee || null, record.regular_fee || null,
            record.currency || 'USD', record.travel_grants === 'true',
            record.student_bursary === 'true', topics, record.status || 'upcoming'
          ]
        );
        imported++;
      } catch (err) {
        errors.push({ row: record.name, error: err.message });
      }
    }

    res.json({
      message: `Imported ${imported} of ${records.length} conferences`,
      imported,
      total: records.length,
      errors,
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
