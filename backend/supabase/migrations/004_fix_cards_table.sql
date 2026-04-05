-- ============================================
-- Fix Cards Table - Add is_favorite & Fix RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add is_favorite column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'is_favorite'
    ) THEN
        ALTER TABLE public.cards ADD COLUMN is_favorite BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Fix RLS policies for cards table
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can insert their own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can delete their own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can manage their own cards" ON public.cards;

-- Create comprehensive policy for all operations
CREATE POLICY "Users can manage their own cards" ON public.cards
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Done! ✅
