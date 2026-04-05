-- ============================================
-- BÜTÜN SQL SCRİPTLƏR (Supabase-də işlədilməli)
-- Kopyalayıb SQL Editor-da işlədin
-- ============================================

-- ======== 1. FAVORITE PAYMENTS ========
CREATE TABLE IF NOT EXISTS public.favorite_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    merchant TEXT NOT NULL,
    category TEXT,
    default_amount DECIMAL(12, 2),
    nickname TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.favorite_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own favorite payments" ON public.favorite_payments;
CREATE POLICY "Users can manage their own favorite payments" ON public.favorite_payments
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ======== 2. AUTO PAYMENTS ========
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

ALTER TABLE public.auto_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own auto payments" ON public.auto_payments;
CREATE POLICY "Users can manage their own auto payments" ON public.auto_payments
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ======== 3. BONUSES - card_name əlavə et ========
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bonuses' AND column_name = 'card_name') THEN
        ALTER TABLE public.bonuses ADD COLUMN card_name TEXT;
    END IF;
END $$;

-- ======== 4. CARDS - is_favorite əlavə et ========
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'is_favorite') THEN
        ALTER TABLE public.cards ADD COLUMN is_favorite BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ======== 5. CARDS RLS FIX ========
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own cards" ON public.cards;
CREATE POLICY "Users can manage their own cards" ON public.cards
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ======== SON: Schema yenilə ========
NOTIFY pgrst, 'reload schema';

-- ✅ Tamamlandı!
