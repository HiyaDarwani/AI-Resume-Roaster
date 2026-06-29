-- supabase_schema.sql
-- Supabase PostgreSQL Database Schema & RLS Policies for AI Resume Roaster

-- 1. Create 'users' table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- maps to NextAuth User ID / Google sub ID
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create 'roasts' table (user_id FK, resume_text, roast_json)
CREATE TABLE IF NOT EXISTS public.roasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    filename TEXT,
    resume_text TEXT NOT NULL,
    roast_json JSONB NOT NULL,
    overall_score INT NOT NULL,
    roast_level TEXT DEFAULT 'medium'::text NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roasts ENABLE ROW LEVEL SECURITY;

-- 4. Set up RLS Policies for public.users
-- Users can only read/write their own profile
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.users FOR INSERT 
    WITH CHECK (auth.uid()::text = id);

-- 5. Set up RLS Policies for public.roasts
-- Users can only read and write their own roast sessions
CREATE POLICY "Users can view their own roasts" 
    ON public.roasts FOR SELECT 
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own roasts" 
    ON public.roasts FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

-- 6. Create indexes for performance and rapid rate limit query lookup
CREATE INDEX IF NOT EXISTS roasts_user_id_idx ON public.roasts(user_id);
CREATE INDEX IF NOT EXISTS roasts_created_at_idx ON public.roasts(created_at);
