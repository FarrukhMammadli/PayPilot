-- CardAssistant Supabase Database Initialization Script

-- 1. Create Custom Enums
DO $$ BEGIN
    CREATE TYPE bank_name_enum AS ENUM ('ABB', 'Kapital', 'Leo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_category_enum AS ENUM ('Utilities', 'Food', 'Transport', 'General');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status_enum AS ENUM ('Success', 'Pending', 'Failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards table
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bank_name bank_name_enum NOT NULL,
    card_number TEXT NOT NULL, -- Storing last 4 digits
    balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    color_theme TEXT,
    expiry_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    merchant_name TEXT NOT NULL,
    category transaction_category_enum DEFAULT 'General',
    status transaction_status_enum DEFAULT 'Success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (Chat History)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    text TEXT,
    is_bot BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security (Enable RLS & Create Policies)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Generic Ownership Policies
CREATE POLICY "Users can only see their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own cards" ON public.cards
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own messages" ON public.messages
    FOR ALL USING (auth.uid() = user_id);

-- 4. Triggers (Auth -> Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Atomic Payment RPC Function
CREATE OR REPLACE FUNCTION process_payment(
    p_card_id UUID,
    p_amount DECIMAL,
    p_merchant TEXT,
    p_category transaction_category_enum DEFAULT 'General'
) RETURNS TEXT AS $$
DECLARE
    v_balance DECIMAL;
    v_user_id UUID;
BEGIN
    -- Get auth user id
    v_user_id := auth.uid();
    
    -- Check balance and user ownership
    SELECT balance INTO v_balance FROM public.cards 
    WHERE id = p_card_id AND user_id = v_user_id;
    
    IF v_balance IS NULL THEN
        RETURN 'CARD_NOT_FOUND';
    END IF;
    
    IF v_balance < p_amount THEN
        RETURN 'INSUFFICIENT_FUNDS';
    END IF;
    
    -- Deduct Balance
    UPDATE public.cards 
    SET balance = balance - p_amount 
    WHERE id = p_card_id;
    
    -- Log Transaction
    INSERT INTO public.transactions (user_id, card_id, amount, merchant_name, category, status)
    VALUES (v_user_id, p_card_id, p_amount, p_merchant, p_category, 'Success');
    
    RETURN 'SUCCESS';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
