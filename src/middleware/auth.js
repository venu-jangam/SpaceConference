const admin = require('../config/firebase');
const db = require('../config/db');

// Verify Firebase ID Token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if user exists in our DB, if not, we'll need to sync them
    const result = await db.query(
      'SELECT id, email, name, role FROM users WHERE email = $1', 
      [decodedToken.email]
    );

    if (result.rows.length === 0) {
      // Logic for auto-creating user on first login could go here
      // For now, return unauthorized if not in sync
      return res.status(401).json({ error: 'User not synced with database' });
    }

    req.user = result.rows[0];
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional auth — attaches user if token exists, but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      const result = await db.query(
        'SELECT id, email, name, role FROM users WHERE email = $1', 
        [decodedToken.email]
      );
      
      if (result.rows.length > 0) {
        req.user = result.rows[0];
        req.firebaseUser = decodedToken;
      }
    }
  } catch (error) {
    // Silently continue
  }
  next();
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin };
