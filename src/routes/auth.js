const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// ============================================================
// POST /api/auth/register — Email registration
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, affiliation } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, affiliation, auth_provider)
       VALUES ($1, $2, $3, $4, 'email')
       RETURNING id, email, name, affiliation, role, created_at`,
      [email, passwordHash, name, affiliation]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/auth/login — Email login
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses Google login. Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/auth/google — Google OAuth login
// ============================================================
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId, avatarUrl } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and Google ID are required' });
    }

    // Check if user exists
    let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    let user;
    if (result.rows.length === 0) {
      // Create new user
      result = await db.query(
        `INSERT INTO users (email, name, google_id, avatar_url, auth_provider)
         VALUES ($1, $2, $3, $4, 'google')
         RETURNING *`,
        [email, name, googleId, avatarUrl]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
      // Update Google ID if not set
      if (!user.google_id) {
        await db.query(
          'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3',
          [googleId, avatarUrl, user.id]
        );
      }
      await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /api/auth/me — Get current user
// ============================================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, name, affiliation, role, avatar_url, auth_provider,
              sectors_of_interest, preferred_lead_time_days, weekly_digest_enabled,
              push_notifications_enabled, created_at, last_login_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// PATCH /api/auth/profile — Update profile
// ============================================================
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, affiliation, sectors_of_interest, preferred_lead_time_days,
            weekly_digest_enabled, push_notifications_enabled } = req.body;

    const result = await db.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        affiliation = COALESCE($2, affiliation),
        sectors_of_interest = COALESCE($3, sectors_of_interest),
        preferred_lead_time_days = COALESCE($4, preferred_lead_time_days),
        weekly_digest_enabled = COALESCE($5, weekly_digest_enabled),
        push_notifications_enabled = COALESCE($6, push_notifications_enabled)
      WHERE id = $7
      RETURNING id, email, name, affiliation, role, sectors_of_interest,
                preferred_lead_time_days, weekly_digest_enabled, push_notifications_enabled`,
      [name, affiliation, sectors_of_interest, preferred_lead_time_days,
       weekly_digest_enabled, push_notifications_enabled, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /api/auth/sync — Sync Firebase user with PostgreSQL
// ============================================================
router.post('/sync', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'ID Token required' });
    }

    const admin = require('../config/firebase');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if user exists
    let userResult = await db.query(
      'SELECT id, email, name, role FROM users WHERE email = $1', 
      [decodedToken.email]
    );

    if (userResult.rows.length === 0) {
      // Create user in PG if they don't exist
      userResult = await db.query(
        `INSERT INTO users (email, name, role, auth_provider, avatar_url) 
         VALUES ($1, $2, 'user', 'google', $3) 
         RETURNING id, email, name, role`,
        [decodedToken.email, decodedToken.name, decodedToken.picture]
      );
      console.log(`[Auth] New user synced from Firebase: ${decodedToken.email}`);
    } else {
      // Update existing user (optional: update name or avatar)
      await db.query(
        'UPDATE users SET name = $1, avatar_url = $2, last_login_at = NOW() WHERE email = $3',
        [decodedToken.name, decodedToken.picture, decodedToken.email]
      );
    }

    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Internal server error during sync' });
  }
});

module.exports = router;

