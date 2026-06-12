-- Hero Section Table
CREATE TABLE IF NOT EXISTS hero_section (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  subtitle VARCHAR(300),
  description TEXT,
  background_image VARCHAR(500),
  button1_text VARCHAR(100),
  button1_link VARCHAR(300),
  button2_text VARCHAR(100),
  button2_link VARCHAR(300),
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'INACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site Statistics Table (single row)
CREATE TABLE IF NOT EXISTS site_statistics (
  id BIGINT PRIMARY KEY,
  conferences_count INT DEFAULT 150,
  countries_count INT DEFAULT 50,
  researchers_count INT DEFAULT 10000,
  publications_count INT DEFAULT 500,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Trust Badges Table
CREATE TABLE IF NOT EXISTS trust_badges (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  icon VARCHAR(100),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

-- Seed default statistics row
INSERT INTO site_statistics (id, conferences_count, countries_count, researchers_count, publications_count)
VALUES (1, 150, 50, 10000, 500)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Seed default trust badges (only if table is empty)
INSERT INTO trust_badges (icon, title, description, display_order, active)
SELECT * FROM (SELECT '🔬' as icon, 'Scopus Indexed' as title, 'All proceedings indexed in Scopus and major global databases' as description, 1 as display_order, true as active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM trust_badges LIMIT 1);

INSERT INTO trust_badges (icon, title, description, display_order, active)
SELECT * FROM (SELECT '✅' as icon, 'Peer Reviewed' as title, 'Rigorous double-blind peer review by domain experts' as description, 2 as display_order, true as active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM trust_badges WHERE title = 'Peer Reviewed' LIMIT 1);

INSERT INTO trust_badges (icon, title, description, display_order, active)
SELECT * FROM (SELECT '🌐' as icon, 'Global Networking' as title, 'Connect with researchers from 50+ countries worldwide' as description, 3 as display_order, true as active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM trust_badges WHERE title = 'Global Networking' LIMIT 1);

INSERT INTO trust_badges (icon, title, description, display_order, active)
SELECT * FROM (SELECT '📚' as icon, 'Publication Opportunities' as title, 'Fast-track publication in indexed journals' as description, 4 as display_order, true as active) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM trust_badges WHERE title = 'Publication Opportunities' LIMIT 1);

SELECT 'Database seed completed successfully!' as result;
SELECT * FROM site_statistics;
SELECT id, icon, title, active FROM trust_badges;
