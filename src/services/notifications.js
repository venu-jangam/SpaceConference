const nodemailer = require('nodemailer');
const db = require('../config/db');

class NotificationService {
  constructor() {
    this.transporter = this._createTransporter();
  }

  _createTransporter() {
    if (process.env.EMAIL_PROVIDER === 'resend') {
      return nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      });
    }

    // SendGrid
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Send a single email notification
  async sendEmail(to, subject, htmlBody, userId, conferenceId, notificationType) {
    try {
      await this.transporter.sendMail({
        from: `SpaceConference <${process.env.EMAIL_FROM || 'notifications@spaceconference.app'}>`,
        to,
        subject,
        html: this._wrapInTemplate(subject, htmlBody),
      });

      // Log the notification
      await db.query(
        `INSERT INTO notification_log (user_id, conference_id, notification_type, channel, subject, body, status, sent_at)
         VALUES ($1, $2, $3, 'email', $4, $5, 'sent', NOW())`,
        [userId, conferenceId, notificationType, subject, htmlBody]
      );

      return true;
    } catch (error) {
      console.error('Email send error:', error);

      await db.query(
        `INSERT INTO notification_log (user_id, conference_id, notification_type, channel, subject, body, status, error_message)
         VALUES ($1, $2, $3, 'email', $4, $5, 'failed', $6)`,
        [userId, conferenceId, notificationType, subject, htmlBody, error.message]
      );

      return false;
    }
  }

  // Check and send deadline notifications
  async processDeadlineNotifications() {
    console.log('[Notifications] Processing deadline notifications...');

    // Get all active notification preferences
    const prefs = await db.query(`
      SELECT np.*, u.email, u.name as user_name, c.*,
             c.name as conf_name, c.slug as conf_slug
      FROM notification_preferences np
      JOIN users u ON np.user_id = u.id
      JOIN conferences c ON np.conference_id = c.id
      WHERE np.is_active = TRUE
        AND (np.snoozed_until IS NULL OR np.snoozed_until < NOW())
        AND np.email_enabled = TRUE
    `);

    const today = new Date();
    let sent = 0;

    for (const pref of prefs.rows) {
      const leadDays = pref.lead_time_days || 7;

      // Check abstract deadline
      if (pref.notify_abstract_deadline && pref.abstract_deadline) {
        const daysUntil = this._daysUntil(pref.abstract_deadline);
        if (daysUntil === leadDays || daysUntil === 1) {
          const alreadySent = await this._checkAlreadySent(pref.user_id, pref.conference_id, 'abstract_deadline', 1);
          if (!alreadySent) {
            await this.sendEmail(
              pref.email,
              `⏰ Abstract deadline for ${pref.conf_name} in ${daysUntil} day(s)!`,
              this._buildDeadlineEmailBody(pref, 'Abstract Submission', pref.abstract_deadline, daysUntil),
              pref.user_id, pref.conference_id, 'abstract_deadline'
            );
            sent++;
          }
        }
      }

      // Check registration deadline
      if (pref.notify_registration_deadline && pref.registration_deadline) {
        const daysUntil = this._daysUntil(pref.registration_deadline);
        if (daysUntil === leadDays || daysUntil === 1) {
          const alreadySent = await this._checkAlreadySent(pref.user_id, pref.conference_id, 'registration_deadline', 1);
          if (!alreadySent) {
            await this.sendEmail(
              pref.email,
              `📝 Registration deadline for ${pref.conf_name} in ${daysUntil} day(s)!`,
              this._buildDeadlineEmailBody(pref, 'Registration', pref.registration_deadline, daysUntil),
              pref.user_id, pref.conference_id, 'registration_deadline'
            );
            sent++;
          }
        }
      }

      // Check conference start
      if (pref.notify_conference_start) {
        const daysUntil = this._daysUntil(pref.start_date);
        if (daysUntil === leadDays || daysUntil === 1) {
          const alreadySent = await this._checkAlreadySent(pref.user_id, pref.conference_id, 'conference_start', 1);
          if (!alreadySent) {
            await this.sendEmail(
              pref.email,
              `🚀 ${pref.conf_name} starts in ${daysUntil} day(s)!`,
              this._buildDeadlineEmailBody(pref, 'Conference Start', pref.start_date, daysUntil),
              pref.user_id, pref.conference_id, 'conference_start'
            );
            sent++;
          }
        }
      }
    }

    console.log(`[Notifications] Sent ${sent} deadline notifications`);
    return sent;
  }

  // Send weekly digest emails
  async sendWeeklyDigest() {
    console.log('[Notifications] Sending weekly digests...');

    const users = await db.query(`
      SELECT * FROM users WHERE weekly_digest_enabled = TRUE
    `);

    let sent = 0;

    for (const user of users.rows) {
      // Get upcoming deadlines in next 30 days
      const conferences = await db.query(`
        SELECT * FROM conferences
        WHERE (
          (abstract_deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') OR
          (registration_deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') OR
          (start_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days')
        )
        ORDER BY start_date ASC
      `);

      if (conferences.rows.length > 0) {
        const htmlBody = this._buildDigestEmailBody(user, conferences.rows);
        await this.sendEmail(
          user.email,
          `📅 Your Weekly Space Conference Digest — ${new Date().toLocaleDateString()}`,
          htmlBody,
          user.id, null, 'weekly_digest'
        );
        sent++;
      }
    }

    console.log(`[Notifications] Sent ${sent} weekly digests`);
    return sent;
  }

  // Send new conference alert to interested users
  async notifyNewConference(conference) {
    const users = await db.query(`
      SELECT DISTINCT u.id, u.email, u.name
      FROM users u
      JOIN notification_preferences np ON u.id = np.user_id
      WHERE np.notify_new_conference = TRUE
        AND np.is_active = TRUE
        AND np.email_enabled = TRUE
        AND np.conference_id IS NULL
        AND (
          np.interest_topics && $1::text[]
          OR array_length(np.interest_topics, 1) IS NULL
        )
    `, [conference.topics || []]);

    let sent = 0;
    for (const user of users.rows) {
      await this.sendEmail(
        user.email,
        `🆕 New conference added: ${conference.name}`,
        this._buildNewConferenceEmailBody(conference),
        user.id, conference.id, 'new_conference'
      );
      sent++;
    }

    return sent;
  }

  // Notify admin about new scraped conference
  async notifyAdminNewScrapedConference(conference) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const admins = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const adminId = admins.rows.length > 0 ? admins.rows[0].id : null;

    await this.sendEmail(
      adminEmail,
      `🤖 New scraped conference needs review: ${conference.name}`,
      `<h2>New Conference Found by Scraper</h2>
       <p><strong>${conference.name}</strong></p>
       <p>Organizer: ${conference.organizer}</p>
       <p>Date: ${conference.start_date} - ${conference.end_date}</p>
       <p>Location: ${conference.city}, ${conference.country}</p>
       <p>Source: ${conference.source}</p>
       <p><a href="${process.env.FRONTEND_URL}/admin">Review in Admin Panel →</a></p>`,
      adminId, null, 'admin_scraper_alert'
    );
  }

  // Helper methods
  _daysUntil(date) {
    const target = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  async _checkAlreadySent(userId, conferenceId, type, withinDays) {
    const result = await db.query(
      `SELECT id FROM notification_log
       WHERE user_id = $1 AND conference_id = $2 AND notification_type = $3
         AND status = 'sent' AND sent_at > NOW() - INTERVAL '${withinDays} days'`,
      [userId, conferenceId, type]
    );
    return result.rows.length > 0;
  }

  _buildDeadlineEmailBody(pref, deadlineType, deadlineDate, daysUntil) {
    return `
      <h2>${deadlineType} Deadline Alert</h2>
      <div style="background: #1a1a2e; border-left: 4px solid #00d4ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="color: #00d4ff; margin: 0 0 8px 0;">${pref.conf_name}</h3>
        <p style="color: #ccc; margin: 4px 0;">📅 ${deadlineType} Deadline: <strong style="color: #ffaa00;">${new Date(deadlineDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
        <p style="color: #ccc; margin: 4px 0;">⏰ ${daysUntil} day(s) remaining</p>
        <p style="color: #ccc; margin: 4px 0;">📍 ${pref.city || 'TBD'}, ${pref.country || ''} | ${pref.format}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/conference/${pref.conf_slug}" 
         style="display: inline-block; background: #00d4ff; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
        View Conference Details →
      </a>
    `;
  }

  _buildDigestEmailBody(user, conferences) {
    const confList = conferences.map(c => {
      const deadlines = [];
      if (c.abstract_deadline) {
        const days = this._daysUntil(c.abstract_deadline);
        if (days > 0 && days <= 30) deadlines.push(`Abstract: ${days}d`);
      }
      if (c.registration_deadline) {
        const days = this._daysUntil(c.registration_deadline);
        if (days > 0 && days <= 30) deadlines.push(`Registration: ${days}d`);
      }
      const startDays = this._daysUntil(c.start_date);
      if (startDays > 0 && startDays <= 30) deadlines.push(`Starts: ${startDays}d`);

      return `
        <div style="background: #16213e; border-radius: 8px; padding: 16px; margin: 8px 0;">
          <h3 style="color: #00d4ff; margin: 0 0 4px 0;">${c.name}</h3>
          <p style="color: #aaa; margin: 2px 0;">📍 ${c.city || 'Online'}, ${c.country || ''} | ${c.format}</p>
          <p style="color: #ffaa00; margin: 2px 0;">⏰ ${deadlines.join(' · ')}</p>
        </div>
      `;
    }).join('');

    return `
      <h2>Your Weekly Space Conference Digest</h2>
      <p>Hi ${user.name || 'Space Explorer'},</p>
      <p>Here are the upcoming deadlines and conferences in the next 30 days:</p>
      ${confList}
      <a href="${process.env.FRONTEND_URL}" 
         style="display: inline-block; background: #00d4ff; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
        Explore All Conferences →
      </a>
    `;
  }

  _buildNewConferenceEmailBody(conference) {
    return `
      <h2>New Conference Added! 🆕</h2>
      <div style="background: #1a1a2e; border-left: 4px solid #00ff88; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="color: #00d4ff; margin: 0 0 8px 0;">${conference.name}</h3>
        <p style="color: #ccc; margin: 4px 0;">🏢 ${conference.organizer}</p>
        <p style="color: #ccc; margin: 4px 0;">📅 ${new Date(conference.start_date).toLocaleDateString()} - ${new Date(conference.end_date).toLocaleDateString()}</p>
        <p style="color: #ccc; margin: 4px 0;">📍 ${conference.city || 'Online'}, ${conference.country || ''}</p>
        <p style="color: #ccc; margin: 4px 0;">🏷️ ${(conference.topics || []).join(', ')}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/conference/${conference.slug}" 
         style="display: inline-block; background: #00d4ff; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
        View Conference →
      </a>
    `;
  }

  _wrapInTemplate(title, body) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background: #0a0a1a; color: #e0e0e0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #00d4ff; font-size: 24px; margin: 0;">🚀 SpaceConference</h1>
          <p style="color: #666; margin: 4px 0;">Your Space Conference Tracker</p>
        </div>
        <div style="background: #0f1129; border-radius: 12px; padding: 24px; border: 1px solid #1a1a3e;">
          ${body}
        </div>
        <div style="text-align: center; margin-top: 32px; color: #555; font-size: 12px;">
          <p>SpaceConference — Never miss a space deadline</p>
          <p><a href="${process.env.FRONTEND_URL}/settings/notifications" style="color: #00d4ff;">Manage notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

module.exports = new NotificationService();
