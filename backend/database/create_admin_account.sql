-- =====================================================
-- CREATE DEFAULT ADMIN ACCOUNT
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This creates a default MAO admin account
-- =====================================================

-- Default Admin Credentials:
-- Email: admin@mao.gov.ph
-- Password: Admin123!@#
-- (Password is hashed with bcrypt, cost factor 10)

INSERT INTO association_officers (
    officer_id,
    full_name,
    position,
    association_name,
    contact_number,
    email,
    address,
    term_start_date,
    term_end_date,
    term_duration,
    farmers_under_supervision,
    password_hash,
    is_active,
    is_verified,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'MAO Administrator',
    'Municipal Agriculture Officer',
    'MAO Culiram',
    '09171234567',
    'admin@mao.gov.ph',
    'Municipal Agriculture Office, Culiram, Prosperidad, Agusan del Sur',
    '2024-01-01',
    '2027-12-31',
    '2024-2027',
    0,
    '$2b$10$YourHashedPasswordHere', -- This will be replaced with actual hash
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =====================================================
-- VERIFY THE ACCOUNT WAS CREATED
-- =====================================================
SELECT 
    officer_id,
    full_name,
    position,
    email,
    is_active,
    is_verified,
    created_at
FROM association_officers
WHERE email = 'admin@mao.gov.ph';

-- =====================================================
-- NOTES
-- =====================================================
-- 1. The password hash above is a placeholder
-- 2. Use the Node.js script below to generate the actual hash
-- 3. Then update this SQL with the real hash
-- 4. Default password: Admin123!@#
-- 5. User should change this after first login
-- =====================================================
