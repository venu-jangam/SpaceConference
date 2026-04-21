# 🚀 SpaceConf Setup Guide

Welcome to **SpaceConf**, the ultimate space conference aggregator. This project is structured as a monorepo for easy development and deployment.

## 📁 Structure
- `frontend/`: React + Tailwind CSS (Vite)
- `backend/`: Node.js Express API
- `database/`: SQL Schema and Seed Data
- `scraper/`: Python Scraping Pipeline

## 🛠️ Local Setup

### 1. Database
- Create a PostgreSQL database named `spaceconf`.
- Import the schema: `psql -d spaceconf -f database/schema.sql`
- Seed the data: `psql -d spaceconf -f database/seed.sql`

### 2. Backend
- Navigate to `backend/`.
- Copy `.env.example` to `.env` and fill in:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `EMAIL_PROVIDER` (Resend or SendGrid)
  - `RESEND_API_KEY`
- Install dependencies: `npm install`
- Start dev server: `npm run dev`

### 3. Frontend
- Navigate to `frontend/`.
- Install dependencies: `npm install`
- Start dev server: `npm run dev` (Runs on http://localhost:5173)

### 4. Scraper (Optional)
- Navigate to `scraper/`.
- Create a virtual environment: `python -m venv venv`
- Activate it and install: `pip install -r requirements.txt`
- Run manually: `python main.py`

## 🎨 Theme Details
- **Primary Background**: Space Obsidian (`#02040a`)
- **Accent Blue**: Electric Cyan (`#00d4ff`)
- **Accent Amber**: Solar Flare (`#ffaa00`)
- **Fonts**: Outfit (Headings), Inter (Body)

## 📡 Deployment
- **Frontend**: Deploy to Vercel (connect the `frontend/` folder).
- **Backend**: Deploy to Railway or Render.
- **Database**: Use Supabase or Railway.
- **Scraper**: Can be run as a GitHub Action or a Cron Job on Render.

---
Built with 🚀 for the Space Community.
