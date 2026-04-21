-- SpaceConference Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================
-- CONFERENCES TABLE
-- ============================================================
CREATE TABLE conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    abstract_deadline DATE,
    early_bird_deadline DATE,
    registration_deadline DATE,
    
    -- Location
    city VARCHAR(255),
    country VARCHAR(255),
    venue VARCHAR(500),
    region VARCHAR(100) CHECK (region IN ('Europe', 'North America', 'South America', 'Asia-Pacific', 'Africa', 'Middle East', 'Global/Online')),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    
    -- Format
    format VARCHAR(50) NOT NULL CHECK (format IN ('In-person', 'Hybrid', 'Online')),
    
    -- Links
    website_url TEXT,
    registration_url TEXT,
    abstract_url TEXT,
    
    -- Fees
    student_fee DECIMAL(10, 2),
    regular_fee DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Bursaries
    travel_grants_available BOOLEAN DEFAULT FALSE,
    student_bursary_available BOOLEAN DEFAULT FALSE,
    bursary_details TEXT,
    
    -- Tags & Topics
    topics TEXT[] DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN (
        'upcoming', 'registration_open', 'abstract_open', 'ongoing', 'past'
    )),
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    source VARCHAR(255), -- Where the data came from (scraper source or 'manual')
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search and filtering
CREATE INDEX idx_conferences_start_date ON conferences(start_date);
CREATE INDEX idx_conferences_end_date ON conferences(end_date);
CREATE INDEX idx_conferences_abstract_deadline ON conferences(abstract_deadline);
CREATE INDEX idx_conferences_registration_deadline ON conferences(registration_deadline);
CREATE INDEX idx_conferences_organizer ON conferences(organizer);
CREATE INDEX idx_conferences_region ON conferences(region);
CREATE INDEX idx_conferences_format ON conferences(format);
CREATE INDEX idx_conferences_status ON conferences(status);
CREATE INDEX idx_conferences_topics ON conferences USING GIN(topics);
CREATE INDEX idx_conferences_name_trgm ON conferences USING GIN(name gin_trgm_ops);
CREATE INDEX idx_conferences_slug ON conferences(slug);

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL if using OAuth
    name VARCHAR(255),
    affiliation VARCHAR(500),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    
    -- Auth provider
    auth_provider VARCHAR(50) DEFAULT 'email' CHECK (auth_provider IN ('email', 'google')),
    google_id VARCHAR(255),
    
    -- Preferences
    sectors_of_interest TEXT[] DEFAULT '{}',
    preferred_lead_time_days INTEGER DEFAULT 7,
    weekly_digest_enabled BOOLEAN DEFAULT FALSE,
    push_notifications_enabled BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- SAVED CONFERENCES (User bookmarks)
-- ============================================================
CREATE TABLE saved_conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, conference_id)
);

CREATE INDEX idx_saved_user ON saved_conferences(user_id);
CREATE INDEX idx_saved_conference ON saved_conferences(conference_id);

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Conference-specific notifications
    conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
    
    -- Global interest-based notifications (when conference_id is NULL)
    interest_topics TEXT[] DEFAULT '{}',
    
    -- What to notify about
    notify_abstract_deadline BOOLEAN DEFAULT TRUE,
    notify_registration_deadline BOOLEAN DEFAULT TRUE,
    notify_conference_start BOOLEAN DEFAULT TRUE,
    notify_new_conference BOOLEAN DEFAULT FALSE,
    
    -- Lead time
    lead_time_days INTEGER DEFAULT 7,
    
    -- Channels
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    snoozed_until TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_pref_user ON notification_preferences(user_id);
CREATE INDEX idx_notif_pref_conference ON notification_preferences(conference_id);

-- ============================================================
-- NOTIFICATION LOG
-- ============================================================
CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conference_id UUID REFERENCES conferences(id) ON DELETE SET NULL,
    
    notification_type VARCHAR(100) NOT NULL, -- 'abstract_deadline', 'registration_deadline', 'conference_start', 'new_conference', 'weekly_digest'
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'push')),
    subject VARCHAR(500),
    body TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    error_message TEXT,
    
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_log_user ON notification_log(user_id);
CREATE INDEX idx_notif_log_status ON notification_log(status);
CREATE INDEX idx_notif_log_created ON notification_log(created_at);

-- ============================================================
-- SCRAPER RUNS LOG
-- ============================================================
CREATE TABLE scraper_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    conferences_found INTEGER DEFAULT 0,
    conferences_added INTEGER DEFAULT 0,
    conferences_updated INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================
-- FUNCTION: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conferences_updated_at
    BEFORE UPDATE ON conferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: Auto-compute conference status
-- ============================================================
CREATE OR REPLACE FUNCTION compute_conference_status(conf conferences)
RETURNS VARCHAR(50) AS $$
BEGIN
    IF conf.end_date < CURRENT_DATE THEN
        RETURN 'past';
    ELSIF conf.start_date <= CURRENT_DATE AND conf.end_date >= CURRENT_DATE THEN
        RETURN 'ongoing';
    ELSIF conf.abstract_deadline IS NOT NULL AND conf.abstract_deadline >= CURRENT_DATE THEN
        RETURN 'abstract_open';
    ELSIF conf.registration_deadline IS NOT NULL AND conf.registration_deadline >= CURRENT_DATE THEN
        RETURN 'registration_open';
    ELSE
        RETURN 'upcoming';
    END IF;
END;
$$ LANGUAGE plpgsql;
