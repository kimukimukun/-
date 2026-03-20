-- FACTORY-HUNT Supabase Schema
-- Run this in your Supabase SQL Editor

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'incident')),
  raw_input TEXT NOT NULL,
  formatted_content JSONB,
  photo_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  report_date DATE NOT NULL,
  operator_name TEXT,
  section TEXT
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert (for MVP without auth)
CREATE POLICY "Allow insert for all" ON public.reports
  FOR INSERT WITH CHECK (true);

-- Policy: anyone can read (for MVP without auth)
CREATE POLICY "Allow read for all" ON public.reports
  FOR SELECT USING (true);

-- Policy: anyone can update (for MVP without auth)
CREATE POLICY "Allow update for all" ON public.reports
  FOR UPDATE USING (true);

-- Storage bucket for report photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow uploads
CREATE POLICY "Allow photo uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'report-photos');

-- Storage policy: allow public reads
CREATE POLICY "Allow public photo reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-photos');

-- Index for faster queries
CREATE INDEX IF NOT EXISTS reports_report_date_idx ON public.reports (report_date DESC);
CREATE INDEX IF NOT EXISTS reports_report_type_idx ON public.reports (report_type);
