-- Nexora AI Photo Booth Database Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STYLES TABLE
CREATE TABLE IF NOT EXISTS styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  thumbnail TEXT,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  category TEXT DEFAULT 'general',
  enabled BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BOOTHS TABLE
CREATE TABLE IF NOT EXISTS booths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  event TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'uploading', 'queued', 'processing', 'completed', 'failed', 'expired')),
  selected_style TEXT,
  input_image TEXT,
  output_image TEXT,
  processing_stage TEXT,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
  device TEXT,
  booth_id UUID REFERENCES booths(id) ON DELETE SET NULL,
  error_message TEXT,
  retry_count INT DEFAULT 0
);

-- 4. ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  generation_time_ms INT,
  style TEXT,
  device TEXT,
  ai_provider TEXT,
  success BOOLEAN DEFAULT true,
  error_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Public can read enabled styles
CREATE POLICY "Public styles read access"
  ON styles FOR SELECT
  USING (enabled = true);

-- Public sessions insert & read by session ID
CREATE POLICY "Allow anonymous sessions create"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read own session"
  ON sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow update session"
  ON sessions FOR UPDATE
  USING (true);

-- STORAGE BUCKETS (Run in Supabase Storage UI or via API):
-- Create two public or authenticated buckets:
-- 1. 'input-images'
-- 2. 'output-images'

