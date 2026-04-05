-- ============================================
-- Favorite Payments & Auto Payments Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Favorite Payments Table
CREATE TABLE IF NOT EXISTS public.favorite_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    merchant TEXT NOT NULL,
    category TEXT,
    default_amount DECIMAL(12, 2),
    nickname TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for favorite_payments
ALTER TABLE public.favorite_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own favorite payments" ON public.favorite_payments;
CREATE POLICY "Users can manage their own favorite payments" ON public.favorite_payments
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Auto Payments Table
CREATE TABLE IF NOT EXISTS public.auto_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    merchant TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    card_id UUID,
    frequency TEXT DEFAULT 'monthly',
    next_payment_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for auto_payments
ALTER TABLE public.auto_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own auto payments" ON public.auto_payments;
CREATE POLICY "Users can manage their own auto payments" ON public.auto_payments
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Add card_name column to bonuses table (if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonuses' AND column_name = 'card_name'
    ) THEN
        ALTER TABLE public.bonuses ADD COLUMN card_name TEXT;
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Done! ✅
