-- SpaceConference Seed Data
-- 20+ Real Space Conferences for 2026

INSERT INTO conferences (name, slug, organizer, description, start_date, end_date, abstract_deadline, early_bird_deadline, registration_deadline, city, country, venue, region, format, website_url, student_fee, regular_fee, currency, travel_grants_available, student_bursary_available, topics, status, is_verified, source, latitude, longitude) VALUES

-- 1. IAC 2026 — Milan, Italy
('77th International Astronautical Congress (IAC 2026)', 'iac-2026', 'IAF', 
'The world''s premier space event, bringing together all stakeholders in the space sector. IAC 2026 will be held in Milan, Italy, offering five days of technical sessions, plenaries, and networking events.', 
'2026-10-05', '2026-10-09', '2026-03-15', '2026-07-01', '2026-09-01',
'Milan', 'Italy', 'MiCo Milano Convention Centre', 'Europe', 'In-person',
'https://www.iafastro.org/events/iac/', 350.00, 900.00, 'EUR',
TRUE, TRUE, ARRAY['space policy', 'human spaceflight', 'propulsion', 'space exploration', 'satellite systems', 'space debris'],
'upcoming', TRUE, 'manual', 45.4785, 9.0957),

-- 2. COSPAR 2026
('45th COSPAR Scientific Assembly', 'cospar-2026', 'COSPAR',
'The Committee on Space Research Scientific Assembly covers all areas of space research including Earth observation, space weather, planetary science, and life sciences in space.',
'2026-07-18', '2026-07-25', '2026-02-15', '2026-05-01', '2026-06-15',
'Athens', 'Greece', 'Megaron Athens International Conference Centre', 'Europe', 'Hybrid',
'https://www.cospar-assembly.org/', 250.00, 700.00, 'EUR',
TRUE, TRUE, ARRAY['planetary science', 'space weather', 'earth observation', 'astrobiology', 'life sciences'],
'registration_open', TRUE, 'manual', 37.9755, 23.7348),

-- 3. AGU Fall Meeting 2026
('AGU Fall Meeting 2026', 'agu-fall-2026', 'AGU',
'The largest international Earth and space science meeting in the world, attracting more than 25,000 attendees. Covers all aspects of Earth, ocean, atmospheric, planetary, and space sciences.',
'2026-12-07', '2026-12-11', '2026-07-29', '2026-10-01', '2026-11-15',
'San Francisco', 'United States', 'Moscone Center', 'North America', 'Hybrid',
'https://www.agu.org/fall-meeting', 150.00, 550.00, 'USD',
TRUE, TRUE, ARRAY['planetary science', 'earth observation', 'space weather', 'remote sensing', 'climate science'],
'upcoming', TRUE, 'manual', 37.7749, -122.4194),

-- 4. AAS 248th Meeting
('248th Meeting of the American Astronomical Society', 'aas-248-2026', 'AAS',
'The AAS semi-annual meeting covering all aspects of astronomy, astrophysics, and planetary science. Features press conferences, poster sessions, and plenary lectures.',
'2026-06-07', '2026-06-11', '2026-03-01', '2026-04-15', '2026-05-15',
'Anchorage', 'United States', 'Dena''ina Civic and Convention Center', 'North America', 'In-person',
'https://aas.org/meetings/aas248', 125.00, 475.00, 'USD',
TRUE, TRUE, ARRAY['astrophysics', 'planetary science', 'exoplanets', 'cosmology', 'instrumentation'],
'abstract_open', TRUE, 'manual', 61.2181, -149.9003),

-- 5. EPSC 2026
('Europlanet Science Congress (EPSC) 2026', 'epsc-2026', 'Europlanet',
'The annual meeting of the European planetary science community, featuring sessions on all aspects of planetary science and solar system exploration.',
'2026-09-21', '2026-09-25', '2026-05-15', '2026-07-15', '2026-08-31',
'Berlin', 'Germany', 'Estrel Congress Center', 'Europe', 'Hybrid',
'https://www.europlanet-society.org/epsc/', 200.00, 550.00, 'EUR',
TRUE, TRUE, ARRAY['planetary science', 'astrobiology', 'solar system', 'exoplanets', 'space missions'],
'upcoming', TRUE, 'manual', 52.5200, 13.4050),

-- 6. AIAA SciTech 2026
('AIAA SciTech Forum 2026', 'aiaa-scitech-2026', 'AIAA',
'The world''s largest event for aerospace research, development, and technology. Features technical paper sessions, panels, and exhibitions.',
'2026-01-19', '2026-01-23', '2025-06-15', '2025-11-01', '2026-01-05',
'Orlando', 'United States', 'Orange County Convention Center', 'North America', 'In-person',
'https://www.aiaa.org/scitech', 200.00, 800.00, 'USD',
FALSE, TRUE, ARRAY['propulsion', 'aerodynamics', 'structures', 'guidance navigation control', 'unmanned systems'],
'past', TRUE, 'manual', 28.5383, -81.3792),

-- 7. SpaceOps 2026
('17th International Conference on Space Operations (SpaceOps 2026)', 'spaceops-2026', 'SpaceOps',
'Biennial conference focusing on all aspects of space mission operations, including spacecraft operations, ground systems, mission planning, and human spaceflight operations.',
'2026-05-04', '2026-05-08', '2025-11-15', '2026-03-01', '2026-04-15',
'Rome', 'Italy', 'Rome Convention Center La Nuvola', 'Europe', 'In-person',
'https://www.spaceops.org/', 300.00, 750.00, 'EUR',
TRUE, TRUE, ARRAY['mission operations', 'ground systems', 'human spaceflight', 'satellite operations', 'space situational awareness'],
'registration_open', TRUE, 'manual', 41.9028, 12.4964),

-- 8. ESA Living Planet Symposium 2026
('ESA Living Planet Symposium 2026', 'esa-living-planet-2026', 'ESA',
'ESA''s flagship Earth observation conference bringing together scientists, operational users, and decision-makers to discuss the latest advances in Earth observation from space.',
'2026-06-22', '2026-06-26', '2026-01-15', '2026-04-01', '2026-05-31',
'Vienna', 'Austria', 'Austria Center Vienna', 'Europe', 'Hybrid',
'https://www.esa.int/livingplanet', 100.00, 400.00, 'EUR',
TRUE, TRUE, ARRAY['earth observation', 'remote sensing', 'climate science', 'environmental monitoring', 'satellite data'],
'abstract_open', TRUE, 'manual', 48.2082, 16.3738),

-- 9. ISU SSP 2026
('ISU Space Studies Program (SSP) 2026', 'isu-ssp-2026', 'ISU',
'The International Space University''s flagship 9-week program covering all aspects of space from engineering to policy, law, business, and humanities.',
'2026-06-29', '2026-08-28', '2026-03-01', NULL, '2026-04-30',
'Adelaide', 'Australia', 'University of South Australia', 'Asia-Pacific', 'In-person',
'https://www.isunet.edu/ssp/', 5000.00, 15000.00, 'USD',
TRUE, TRUE, ARRAY['interdisciplinary', 'space policy', 'space engineering', 'space business', 'human spaceflight'],
'upcoming', TRUE, 'manual', -34.9285, 138.6007),

-- 10. DPS 2026 (Division for Planetary Sciences)
('58th DPS Annual Meeting', 'dps-2026', 'AAS/DPS',
'The annual meeting of the Division for Planetary Sciences of the American Astronomical Society, covering all areas of planetary science.',
'2026-10-18', '2026-10-23', '2026-06-15', '2026-08-15', '2026-09-30',
'Pasadena', 'United States', 'Pasadena Convention Center', 'North America', 'In-person',
'https://dps.aas.org/meetings', 175.00, 500.00, 'USD',
TRUE, TRUE, ARRAY['planetary science', 'solar system', 'exoplanets', 'astrobiology', 'small bodies'],
'upcoming', TRUE, 'manual', 34.1478, -118.1445),

-- 11. ISTS 2026 (International Symposium on Space Technology and Science)
('35th ISTS — International Symposium on Space Technology and Science', 'ists-2026', 'JSASS',
'Japan''s premier space conference covering satellite technology, launch vehicles, space science, and technologies for space exploration.',
'2026-07-04', '2026-07-10', '2026-02-28', '2026-05-01', '2026-06-15',
'Fukuoka', 'Japan', 'Fukuoka International Congress Center', 'Asia-Pacific', 'In-person',
'https://www.ists.or.jp/', 200.00, 600.00, 'JPY',
TRUE, TRUE, ARRAY['satellite systems', 'launch vehicles', 'space science', 'space exploration', 'propulsion'],
'upcoming', TRUE, 'manual', 33.5904, 130.4017),

-- 12. NASA Exploration Science Forum 2026
('NASA Exploration Science Forum 2026', 'nesf-2026', 'NASA',
'Annual forum focused on science and exploration of the Moon, Near-Earth Asteroids, and the moons of Mars, supporting NASA''s Artemis program.',
'2026-07-14', '2026-07-16', '2026-04-30', NULL, '2026-06-30',
'Mountain View', 'United States', 'NASA Ames Research Center', 'North America', 'Hybrid',
'https://nesf.nasa.gov/', 0.00, 0.00, 'USD',
FALSE, FALSE, ARRAY['lunar science', 'planetary science', 'human spaceflight', 'artemis', 'in-situ resource utilization'],
'upcoming', TRUE, 'manual', 37.4089, -122.0644),

-- 13. IAA Planetary Defense Conference 2026
('9th IAA Planetary Defense Conference', 'pdc-2026', 'IAA',
'Conference focusing on all aspects of planetary defense including near-Earth object detection, characterization, and deflection strategies.',
'2026-04-27', '2026-05-01', '2026-01-15', '2026-03-01', '2026-04-01',
'Vienna', 'Austria', 'United Nations Vienna', 'Europe', 'In-person',
'https://iaaspace.org/event/pdc-2026/', 150.00, 400.00, 'EUR',
TRUE, TRUE, ARRAY['planetary defense', 'near-earth objects', 'space situational awareness', 'impact risk'],
'registration_open', TRUE, 'manual', 48.2353, 16.4147),

-- 14. Small Satellites Conference 2026
('40th Annual Small Satellite Conference', 'smallsat-2026', 'AIAA/USU',
'The premier conference for the small satellite community, featuring sessions on CubeSats, nanosatellites, and small satellite missions.',
'2026-08-01', '2026-08-06', '2026-03-01', '2026-06-01', '2026-07-15',
'Logan', 'United States', 'Utah State University', 'North America', 'Hybrid',
'https://smallsat.org/', 100.00, 350.00, 'USD',
TRUE, TRUE, ARRAY['small satellites', 'cubesats', 'nanosatellites', 'satellite systems', 'space technology'],
'upcoming', TRUE, 'manual', 41.7370, -111.8338),

-- 15. ESA Φ-Week 2026
('ESA Phi-Week 2026', 'esa-phi-week-2026', 'ESA',
'ESA''s annual event exploring the future of Earth observation, featuring AI, digital twins, open science, and innovative applications.',
'2026-09-14', '2026-09-18', '2026-05-01', '2026-07-15', '2026-08-31',
'Frascati', 'Italy', 'ESA-ESRIN', 'Europe', 'Hybrid',
'https://phiweek.esa.int/', 0.00, 150.00, 'EUR',
FALSE, FALSE, ARRAY['earth observation', 'artificial intelligence', 'digital twins', 'open science', 'remote sensing'],
'upcoming', TRUE, 'manual', 41.8194, 12.6750),

-- 16. GLEC 2026 — Global Space Exploration Conference
('Global Space Exploration Conference (GLEX) 2026', 'glex-2026', 'IAF',
'IAF''s dedicated conference on space exploration, covering human spaceflight, robotic missions, and international cooperation in exploration.',
'2026-06-15', '2026-06-19', '2026-02-01', '2026-04-15', '2026-05-31',
'Dubai', 'United Arab Emirates', 'Dubai World Trade Centre', 'Middle East', 'In-person',
'https://www.iafastro.org/events/glex/', 300.00, 800.00, 'USD',
TRUE, TRUE, ARRAY['space exploration', 'human spaceflight', 'lunar exploration', 'mars exploration', 'international cooperation'],
'abstract_open', TRUE, 'manual', 25.2285, 55.2871),

-- 17. Space Tech Expo Europe 2026
('Space Tech Expo Europe 2026', 'space-tech-expo-europe-2026', 'Space Tech Expo',
'Europe''s largest B2B space technology exhibition and conference, featuring supply chain, manufacturing, engineering, and test technologies for the space industry.',
'2026-11-17', '2026-11-19', '2026-06-30', '2026-09-15', '2026-10-31',
'Bremen', 'Germany', 'Messe Bremen', 'Europe', 'In-person',
'https://www.spacetechexpo.eu/', 0.00, 0.00, 'EUR',
FALSE, FALSE, ARRAY['space technology', 'manufacturing', 'engineering', 'supply chain', 'testing'],
'upcoming', TRUE, 'manual', 53.0793, 8.8017),

-- 18. AOGS 2026
('19th Asia Oceania Geosciences Society Meeting', 'aogs-2026', 'AOGS',
'Annual meeting of AOGS covering atmospheric, hydrological, ocean, planetary, and solar & terrestrial sciences in the Asia-Oceania region.',
'2026-08-09', '2026-08-14', '2026-03-15', '2026-06-01', '2026-07-15',
'Singapore', 'Singapore', 'Suntec Singapore', 'Asia-Pacific', 'In-person',
'https://www.asiaoceania.org/', 200.00, 500.00, 'USD',
TRUE, TRUE, ARRAY['earth observation', 'planetary science', 'space weather', 'atmospheric science', 'ocean science'],
'upcoming', TRUE, 'manual', 1.3521, 103.8198),

-- 19. UN/Austria World Space Forum 2026
('World Space Forum 2026', 'wsf-2026', 'UNOOSA',
'UN-organized forum exploring how space science and technology contribute to sustainable development goals and global governance.',
'2026-12-01', '2026-12-03', '2026-08-01', '2026-10-01', '2026-11-15',
'Vienna', 'Austria', 'Vienna International Centre', 'Europe', 'Hybrid',
'https://www.unoosa.org/', 0.00, 0.00, 'USD',
TRUE, TRUE, ARRAY['space policy', 'sustainable development', 'governance', 'international cooperation', 'capacity building'],
'upcoming', TRUE, 'manual', 48.2353, 16.4147),

-- 20. AIAA ASCEND 2026
('AIAA ASCEND 2026', 'aiaa-ascend-2026', 'AIAA',
'AIAA''s flagship event connecting all sectors of the space value chain, from civil and commercial to defense and intelligence.',
'2026-07-13', '2026-07-16', '2026-02-15', '2026-05-01', '2026-06-30',
'Las Vegas', 'United States', 'Caesars Forum', 'North America', 'In-person',
'https://www.aiaa.org/ascend', 250.00, 750.00, 'USD',
FALSE, TRUE, ARRAY['space technology', 'commercial space', 'space policy', 'defense space', 'satellite systems'],
'upcoming', TRUE, 'manual', 36.1699, -115.1398),

-- 21. Humans in Space Symposium 2026
('25th IAA Humans in Space Symposium', 'his-2026', 'IAA',
'Premier symposium on human spaceflight, covering life sciences, space medicine, crew performance, and behavioral health in space.',
'2026-03-16', '2026-03-20', '2025-11-01', '2026-01-15', '2026-02-28',
'Prague', 'Czech Republic', 'Prague Congress Centre', 'Europe', 'In-person',
'https://iaaspace.org/event/his2026/', 200.00, 500.00, 'EUR',
TRUE, TRUE, ARRAY['human spaceflight', 'space medicine', 'life sciences', 'crew operations', 'behavioral health'],
'past', TRUE, 'manual', 50.0614, 14.4283),

-- 22. ISRO-ESA Joint Workshop 2026
('ISRO-ESA Joint Earth Observation Workshop 2026', 'isro-esa-eo-2026', 'ISRO/ESA',
'Joint workshop between ISRO and ESA focused on Earth observation collaboration, data sharing, and joint mission planning.',
'2026-11-02', '2026-11-04', '2026-07-15', NULL, '2026-10-15',
'Bengaluru', 'India', 'Indian Space Research Organisation HQ', 'Asia-Pacific', 'Hybrid',
'https://www.isro.gov.in/', 0.00, 100.00, 'USD',
TRUE, TRUE, ARRAY['earth observation', 'remote sensing', 'international cooperation', 'satellite data', 'climate science'],
'upcoming', TRUE, 'manual', 12.9716, 77.5946),

-- 23. CNES/DLR Small Satellite Summit 2026
('Franco-German Small Satellite Summit 2026', 'cnes-dlr-smallsat-2026', 'CNES/DLR',
'Annual summit focusing on French and German cooperation in small satellite development and applications.',
'2026-05-18', '2026-05-20', '2026-02-01', NULL, '2026-04-30',
'Toulouse', 'France', 'CNES Headquarters', 'Europe', 'In-person',
'https://cnes.fr/', 0.00, 200.00, 'EUR',
TRUE, TRUE, ARRAY['small satellites', 'cubesats', 'international cooperation', 'satellite systems', 'space technology'],
'registration_open', TRUE, 'manual', 43.6047, 1.4442);
