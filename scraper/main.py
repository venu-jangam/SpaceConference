import os
import sys
import logging
import psycopg2
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import requests
from datetime import datetime

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("scraper.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

class SpaceScraper:
    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL")
        self.conn = None

    def connect_db(self):
        try:
            self.conn = psycopg2.connect(self.db_url)
            return True
        except Exception as e:
            logging.error(f"Database connection failed: {e}")
            return False

    def close_db(self):
        if self.conn:
            self.conn.close()

    def add_conference(self, data):
        """Add a conference to the database, avoids duplicates via slug."""
        if not self.conn:
            return

        try:
            with self.conn.cursor() as cur:
                # Generate slug
                slug = data['name'].lower().replace(' ', '-').replace('(', '').replace(')', '')[:100]
                
                cur.execute("""
                    INSERT INTO conferences (
                        name, slug, organizer, description, start_date, end_date,
                        city, country, format, website_url, topics, status, is_verified, source
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (slug) DO NOTHING
                    RETURNING id
                """, (
                    data['name'], slug, data['organizer'], data['description'],
                    data['start_date'], data['end_date'], data['city'], data['country'],
                    data['format'], data['website_url'], data['topics'], 'upcoming',
                    False, 'scraper'
                ))
            self.conn.commit()
            logging.info(f"Successfully processed: {data['name']}")
        except Exception as e:
            logging.error(f"Error adding conference {data['name']}: {e}")
            self.conn.rollback()

    def scrape_iaf(self):
        """Example scraper for IAF (International Astronautical Federation)"""
        url = "https://www.iafastro.org/events/iac/"
        logging.info(f"Scraping IAF: {url}")
        
        try:
            # Note: In a real scenario, we might use Playwright here for JS-heavy sites
            response = requests.get(url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # This is a representative parsing logic
            # In production, we would use specific CSS selectors based on the site's live DOM
            conferences = [
                {
                    "name": "77th International Astronautical Congress (IAC 2026)",
                    "organizer": "IAF",
                    "description": "The premier global space event in Milan.",
                    "start_date": "2026-10-05",
                    "end_date": "2026-10-09",
                    "city": "Milan",
                    "country": "Italy",
                    "format": "In-person",
                    "website_url": "https://www.iafastro.org/events/iac/iac-2026/",
                    "topics": ["exploration", "policy", "industry"]
                }
            ]

            for conf in conferences:
                self.add_conference(conf)
                
        except Exception as e:
            logging.error(f"IAF Scraper error: {e}")

    def run(self):
        logging.info("Starting weekly scraper run...")
        if not self.connect_db():
            return

        # Trigger different scrapers
        self.scrape_iaf()
        
        self.close_db()
        logging.info("Scraper run completed.")

if __name__ == "__main__":
    scraper = SpaceScraper()
    scraper.run()
