const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// ============================================================
// GET /api/notifications/preferences — Get user's notification prefs
// ============================================================
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT np.*, c.name as conference_name, c.slug as conference_slug
       FROM notification_preferences np
       LEFT JOIN conferences c ON np.conference_id = c.id
       WHERE np.user_id = $1
       ORDER BY np.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/notifications/preferences — Create notification pref
// ============================================================
router.post('/preferences', authenticate, async (req, res) => {
  try {
    const {
      conference_id,
      interest_topics,
      notify_abstract_deadline,
      notify_registration_deadline,
      notify_conference_start,
      notify_new_conference,
      lead_time_days,
      email_enabled,
      push_enabled,
    } = req.body;

    const result = await db.query(
      `INSERT INTO notification_preferences (
        user_id, conference_id, interest_topics,
        notify_abstract_deadline, notify_registration_deadline,
        notify_conference_start, notify_new_conference,
        lead_time_days, email_enabled, push_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        req.user.id, conference_id || null, interest_topics || [],
        notify_abstract_deadline !== false, notify_registration_deadline !== false,
        notify_conference_start !== false, notify_new_conference || false,
        lead_time_days || 7, email_enabled !== false, push_enabled || false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating notification preference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// PATCH /api/notifications/preferences/:id — Update pref
// ============================================================
router.patch('/preferences/:id', authenticate, async (req, res) => {
  try {
    const fields = req.body;
    const sets = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'notify_abstract_deadline', 'notify_registration_deadline',
      'notify_conference_start', 'notify_new_conference',
      'lead_time_days', 'email_enabled', 'push_enabled',
      'is_active', 'snoozed_until', 'interest_topics'
    ];

    for (const [key, value] of Object.entries(fields)) {
      if (!allowedFields.includes(key)) continue;
      sets.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.params.id, req.user.id);
    const result = await db.query(
      `UPDATE notification_preferences SET ${sets.join(', ')}
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification preference not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating notification preference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// DELETE /api/notifications/preferences/:id — Delete pref
// ============================================================
router.delete('/preferences/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM notification_preferences WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification preference not found' });
    }

    res.json({ message: 'Notification preference deleted' });
  } catch (error) {
    console.error('Error deleting notification preference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/notifications/log — Get notification history
// ============================================================
router.get('/log', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(
      `SELECT nl.*, c.name as conference_name, c.slug as conference_slug
       FROM notification_log nl
       LEFT JOIN conferences c ON nl.conference_id = c.id
       WHERE nl.user_id = $1
       ORDER BY nl.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notification log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
