require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const conferenceRoutes = require('./routes/conferences');
const authRoutes = require('./routes/auth');
const savedRoutes = require('./routes/saved');
const notificationRoutes = require('./routes/notifications');
const notificationService = require('./services/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Middleware
// ============================================================
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================================
// Routes
// ============================================================
app.use('/api/conferences', conferenceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ============================================================
// Cron Jobs
// ============================================================

// Process deadline notifications daily at 8:00 AM UTC
cron.schedule('0 8 * * *', async () => {
  try {
    await notificationService.processDeadlineNotifications();
  } catch (error) {
    console.error('[Cron] Deadline notification error:', error);
  }
});

// Send weekly digest every Monday at 7:00 AM UTC
cron.schedule('0 7 * * 1', async () => {
  try {
    await notificationService.sendWeeklyDigest();
  } catch (error) {
    console.error('[Cron] Weekly digest error:', error);
  }
});

// Update conference statuses daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const db = require('./config/db');
    await db.query(`
      UPDATE conferences SET status = 
        CASE
          WHEN end_date < CURRENT_DATE THEN 'past'
          WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'ongoing'
          WHEN abstract_deadline IS NOT NULL AND abstract_deadline >= CURRENT_DATE THEN 'abstract_open'
          WHEN registration_deadline IS NOT NULL AND registration_deadline >= CURRENT_DATE THEN 'registration_open'
          ELSE 'upcoming'
        END
      WHERE status != 'past'
    `);
    console.log('[Cron] Conference statuses updated');
  } catch (error) {
    console.error('[Cron] Status update error:', error);
  }
});

// ============================================================
// Error handler
// ============================================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================================
// Start
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 SpaceConference API running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
