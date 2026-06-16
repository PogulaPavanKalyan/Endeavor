-- ====================================================================
-- DATABASE INTEGRITY & DIAGNOSTIC QUERIES FOR ENDEAVOR PORTAL
-- ====================================================================

-- 1. Check for Duplicate Registrations
-- Detects if the same email has registered multiple times.
SELECT email, COUNT(*) as registration_count 
FROM registrations 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 2. Check for Orphaned Conference Photos
-- Finds conference detail records referencing non-existent photos.
SELECT cd.id as conference_id, cd.tittle as title, cd.photo_id 
FROM conference_details cd 
LEFT JOIN conference_photos cp ON cd.photo_id = cp.id 
WHERE cd.photo_id IS NOT NULL AND cp.id IS NULL;

-- 3. Check for Orphaned Speaker Photos
-- Finds speakers referencing non-existent photos.
SELECT s.id as speaker_id, s.name as speaker_name, s.photo_id 
FROM speakers s 
LEFT JOIN speaker_photos sp ON s.photo_id = sp.id 
WHERE s.photo_id IS NOT NULL AND sp.id IS NULL;

-- 4. Check for Orphaned Sponsor Images
-- Finds sponsors referencing non-existent images.
SELECT sp.id as sponsor_id, sp.sponsor_name, sp.image_id 
FROM sponsors sp 
LEFT JOIN sponsor_images si ON sp.image_id = si.id 
WHERE sp.image_id IS NOT NULL AND si.id IS NULL;

-- 5. Retrieve Abstract Submissions Missing Upload Files
-- Lists abstracts where the file path is empty or NULL.
SELECT id, full_name, email, presentation_type, file_path 
FROM abstract_submissions 
WHERE file_path IS NULL OR file_path = '';

-- 6. Verify Session Time Allocations and Conflict Checking
-- Finds any sessions with missing titles or invalid ranges.
SELECT id, name, time_range, speaker_name 
FROM sessions 
WHERE name IS NULL OR time_range IS NULL OR time_range = '';

-- 7. Audit Incomplete Registrations (Simulated payments that failed or pending)
SELECT id, full_name, email, total_amount, payment_status, transaction_id 
FROM registrations 
WHERE payment_status = 'PENDING' OR payment_status IS NULL;
