const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// ============================================================
// GET /api/saved — Get user's saved conferences
// ============================================================
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, sc.created_at as saved_at
       FROM saved_conferences sc
       JOIN conferences c ON sc.conference_id = c.id
       WHERE sc.user_id = $1
       ORDER BY c.start_date ASC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching saved conferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/saved/:conferenceId — Save a conference
// ============================================================
router.post('/:conferenceId', authenticate, async (req, res) => {
  try {
    // Check conference exists
    const conf = await db.query('SELECT id FROM conferences WHERE id = $1', [req.params.conferenceId]);
    if (conf.rows.length === 0) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    await db.query(
      `INSERT INTO saved_conferences (user_id, conference_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, conference_id) DO NOTHING`,
      [req.user.id, req.params.conferenceId]
    );

    res.status(201).json({ message: 'Conference saved' });
  } catch (error) {
    console.error('Error saving conference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// DELETE /api/saved/:conferenceId — Remove from saved
// ============================================================
router.delete('/:conferenceId', authenticate, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM saved_conferences WHERE user_id = $1 AND conference_id = $2',
      [req.user.id, req.params.conferenceId]
    );

    res.json({ message: 'Conference removed from saved' });
  } catch (error) {
    console.error('Error removing saved conference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
