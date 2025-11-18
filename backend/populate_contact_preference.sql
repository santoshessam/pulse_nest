-- Script to populate contact_preference field with random distribution
-- 30% phone, 30% email, 40% text

UPDATE team_pulse_nest.customers
SET contact_preference = CASE
    WHEN RANDOM() < 0.30 THEN 'phone'
    WHEN RANDOM() < 0.60 THEN 'email'
    ELSE 'text'
END
WHERE contact_preference IS NULL OR contact_preference = '';

-- Verify the distribution
SELECT
    contact_preference,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM team_pulse_nest.customers
WHERE contact_preference IS NOT NULL
GROUP BY contact_preference
ORDER BY contact_preference;
