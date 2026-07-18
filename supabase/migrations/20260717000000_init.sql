-- Supabase Database Schema Initialization
-- Migration: 20260717000000_init.sql

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Matches Clerk User ID
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Users Table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    scan_email TEXT NOT NULL,
    home_address TEXT DEFAULT '' NOT NULL,
    phone_number TEXT DEFAULT '' NOT NULL,
    autopilot_enabled BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Settings Table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 4. Create Privacy Scores Table
CREATE TABLE IF NOT EXISTS public.privacy_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    overall_score INTEGER DEFAULT 100 CHECK (overall_score >= 0 AND overall_score <= 100) NOT NULL,
    exposed_records_count INTEGER DEFAULT 0 NOT NULL,
    pending_removals_count INTEGER DEFAULT 0 NOT NULL,
    completed_removals_count INTEGER DEFAULT 0 NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Privacy Scores Table
ALTER TABLE public.privacy_scores ENABLE ROW LEVEL SECURITY;

-- 5. Create Scans Table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    scan_type TEXT DEFAULT 'manual' CHECK (scan_type IN ('manual', 'automated')) NOT NULL,
    search_criteria_hash TEXT NOT NULL,
    status TEXT DEFAULT 'scanning' CHECK (status IN ('idle', 'scanning', 'completed', 'failed')) NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for Scans Table
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- 6. Create Scan Results Table
CREATE TABLE IF NOT EXISTS public.scan_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
    broker_name TEXT NOT NULL,
    record_preview TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('high', 'medium', 'low')) NOT NULL,
    match_status TEXT DEFAULT 'exposed' CHECK (match_status IN ('exposed', 'removed')) NOT NULL,
    found_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Scan Results Table
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- 7. Create Removal Requests Table
CREATE TABLE IF NOT EXISTS public.removal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    broker_name TEXT NOT NULL,
    current_status TEXT DEFAULT 'pending' CHECK (current_status IN ('pending', 'processing', 'completed', 'failed', 'exposed', 'refused')) NOT NULL,
    submitted_date TEXT,
    resolved_date TEXT,
    tracking_log JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Removal Requests Table
ALTER TABLE public.removal_requests ENABLE ROW LEVEL SECURITY;

-- 8. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    size TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Reports Table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- RLS POLICIES DEFINITIONS
-- ========================================================

-- Users Policies
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE USING (auth.uid() = id);

-- Settings Policies
CREATE POLICY "Users can view their own settings" 
ON public.settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.settings FOR UPDATE USING (auth.uid() = user_id);

-- Privacy Scores Policies
CREATE POLICY "Users can view their own privacy scores" 
ON public.privacy_scores FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy scores" 
ON public.privacy_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scans Policies
CREATE POLICY "Users can view their own scans" 
ON public.scans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans" 
ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans" 
ON public.scans FOR UPDATE USING (auth.uid() = user_id);

-- Scan Results Policies
CREATE POLICY "Users can view scan results for their own scans" 
ON public.scan_results FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.scans 
        WHERE public.scans.id = public.scan_results.scan_id 
        AND public.scans.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert scan results for their own scans" 
ON public.scan_results FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.scans 
        WHERE public.scans.id = public.scan_results.scan_id 
        AND public.scans.user_id = auth.uid()
    )
);

-- Removal Requests Policies
CREATE POLICY "Users can view their own removal requests" 
ON public.removal_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own removal requests" 
ON public.removal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own removal requests" 
ON public.removal_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own removal requests" 
ON public.removal_requests FOR DELETE USING (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Users can view their own reports" 
ON public.reports FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" 
ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================================
-- INDEXES FOR PERFORMANCE
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_scores_user_id ON public.privacy_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_scan_id ON public.scan_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_removal_requests_user_id ON public.removal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);

-- 9. Create Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT CHECK (category IN ('bug', 'suggestion', 'other')) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
