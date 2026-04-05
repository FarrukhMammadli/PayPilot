-- Seed Data Migration for CardAssistant
-- Run this after creating a demo user in Supabase Auth Dashboard
-- Demo User: demo@app.com / demo123456

-- ============================================================================
-- STEP 1: Create demo user via Supabase Dashboard
-- Go to Authentication > Users > Add User
-- Email: demo@app.com
-- Password: demo123456 (or any 6+ chars)
-- ============================================================================

-- ============================================================================
-- STEP 2: After user is created, get the user ID and replace below
-- Replace 'DEMO_USER_ID' with the actual UUID from Supabase Dashboard
-- ============================================================================

-- ============================================================================
-- STEP 3: PREPARE ENUMS (Run this block separately first if it fails)
-- PostgreSQL enums require the ADD VALUE to be committed before usage.
-- ============================================================================
DO $$ BEGIN
    ALTER TYPE transaction_category_enum ADD VALUE 'Shopping';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE transaction_category_enum ADD VALUE 'Transfer';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- STEP 4: SEED DATA (Run this after Step 3 succeeds)
-- ============================================================================

-- Create demo cards for the user
INSERT INTO public.cards (user_id, bank_name, card_number, balance, color_theme, expiry_date) VALUES
-- Replace DEMO_USER_ID with actual user UUID from Supabase Auth
('DEMO_USER_ID', 'ABB'::bank_name_enum, '4532', 2450.75, 'gradient1', '12/27'),
('DEMO_USER_ID', 'Kapital'::bank_name_enum, '8821', 1850.50, 'gradient2', '08/26'),
('DEMO_USER_ID', 'Leo'::bank_name_enum, '6234', 890.25, 'gradient3', '03/28');

-- Create demo transactions
INSERT INTO public.transactions (user_id, card_id, amount, merchant_name, category, status) 
SELECT 
    c.user_id,
    c.id,
    tx.amount,
    tx.merchant_name,
    tx.category::transaction_category_enum,
    tx.status::transaction_status_enum
FROM public.cards c
CROSS JOIN (
    VALUES 
        (-25.50, 'Azerishiq', 'Utilities', 'Success'),
        (-45.00, 'Bakkafe', 'Food', 'Success'),
        (-12.80, 'BakuBus', 'Transport', 'Success'),
        (-89.99, 'Port Baku Mall', 'Shopping', 'Success'),
        (-50.00, 'Azeriqaz', 'Utilities', 'Success'),
        (-15.00, 'Wolt', 'Food', 'Success'),
        (-8.50, 'Bolt', 'Transport', 'Success'),
        (-120.00, 'Bravo Supermarket', 'Food', 'Success'),
        (-35.00, 'Nar Mobile', 'General', 'Success'),
        (-200.00, 'Transfer to Friend', 'Transfer', 'Success')
) AS tx(amount, merchant_name, category, status)
WHERE c.bank_name = 'ABB'
LIMIT 10;

-- ============================================================================
-- ALTERNATIVE: If you want to use a specific user ID directly
-- Run these commands in Supabase SQL Editor after creating the user
-- ============================================================================

-- To find your demo user ID, run:
-- SELECT id FROM auth.users WHERE email = 'demo@app.com';

-- Then copy the ID and use it in the INSERT statements above
