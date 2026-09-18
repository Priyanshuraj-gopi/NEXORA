-- Nexora CRM & Lead Management Schema Migration
-- Run this in your Supabase SQL Editor: https://app.supabase.com

-- 1. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  style TEXT,
  marketing_consent BOOLEAN DEFAULT false,
  lifecycle_stage TEXT NOT NULL DEFAULT 'lead_captured'
    CHECK (lifecycle_stage IN ('lead_captured', 'photo_delivered', 'downloaded', 'follow_up_ready', 'converted')),
  delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BOOKING INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS booking_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  event_type TEXT NOT NULL DEFAULT 'corporate'
    CHECK (event_type IN ('corporate', 'wedding', 'festival', 'private_party', 'exhibition')),
  event_date DATE,
  estimated_guests INT,
  location TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'proposal_sent', 'booked', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CRM EVENT TIMELINE
CREATE TABLE IF NOT EXISTS crm_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_timeline ENABLE ROW LEVEL SECURITY;

-- Allow anonymous submission of leads and booking inquiries
CREATE POLICY "Allow public insert to leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert to booking inquiries"
  ON booking_inquiries FOR INSERT
  WITH CHECK (true);

-- Admin read access
CREATE POLICY "Allow admin read access to leads"
  ON leads FOR SELECT
  USING (true);

CREATE POLICY "Allow admin read access to booking inquiries"
  ON booking_inquiries FOR SELECT
  USING (true);

