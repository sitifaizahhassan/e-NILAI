-- ============================================================
-- TAPAK STANDARD 4 - Pencerapan Tables
-- Run these SQL statements in Supabase SQL Editor
-- ============================================================

-- Table: pencerapan_kendiri (Self-reflection form)
CREATE TABLE IF NOT EXISTS pencerapan_kendiri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guru_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  maklumat JSONB DEFAULT '{}'::jsonb,
  scores JSONB DEFAULT '{}'::jsonb,
  catatan TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: pencerapan_1 (First formal observation form)
CREATE TABLE IF NOT EXISTS pencerapan_1 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guru_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  maklumat JSONB DEFAULT '{}'::jsonb,
  scores JSONB DEFAULT '{}'::jsonb,
  catatan TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: pencerapan_2 (Second formal observation form)
CREATE TABLE IF NOT EXISTS pencerapan_2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guru_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  maklumat JSONB DEFAULT '{}'::jsonb,
  scores JSONB DEFAULT '{}'::jsonb,
  catatan TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS for all pencerapan tables
ALTER TABLE pencerapan_kendiri ENABLE ROW LEVEL SECURITY;
ALTER TABLE pencerapan_1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pencerapan_2 ENABLE ROW LEVEL SECURITY;

-- pencerapan_kendiri policies
CREATE POLICY "Guru can view own pencerapan_kendiri"
  ON pencerapan_kendiri FOR SELECT
  USING (auth.uid() = guru_id);

CREATE POLICY "Guru can insert own pencerapan_kendiri"
  ON pencerapan_kendiri FOR INSERT
  WITH CHECK (auth.uid() = guru_id);

CREATE POLICY "Guru can update own pencerapan_kendiri"
  ON pencerapan_kendiri FOR UPDATE
  USING (auth.uid() = guru_id AND status = 'draft');

-- pencerapan_1 policies
CREATE POLICY "Guru can view own pencerapan_1"
  ON pencerapan_1 FOR SELECT
  USING (auth.uid() = guru_id);

CREATE POLICY "Guru can insert own pencerapan_1"
  ON pencerapan_1 FOR INSERT
  WITH CHECK (auth.uid() = guru_id);

CREATE POLICY "Guru can update own pencerapan_1"
  ON pencerapan_1 FOR UPDATE
  USING (auth.uid() = guru_id AND status = 'draft');

-- pencerapan_2 policies
CREATE POLICY "Guru can view own pencerapan_2"
  ON pencerapan_2 FOR SELECT
  USING (auth.uid() = guru_id);

CREATE POLICY "Guru can insert own pencerapan_2"
  ON pencerapan_2 FOR INSERT
  WITH CHECK (auth.uid() = guru_id);

CREATE POLICY "Guru can update own pencerapan_2"
  ON pencerapan_2 FOR UPDATE
  USING (auth.uid() = guru_id AND status = 'draft');

-- Admin can view all (if admin role exists in profiles)
CREATE POLICY "Admin can view all pencerapan_kendiri"
  ON pencerapan_kendiri FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can view all pencerapan_1"
  ON pencerapan_1 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can view all pencerapan_2"
  ON pencerapan_2 FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- Add extra columns to profiles table if not exists
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS nama TEXT,
  ADD COLUMN IF NOT EXISTS no_kp TEXT,
  ADD COLUMN IF NOT EXISTS jawatan TEXT,
  ADD COLUMN IF NOT EXISTS opsyen TEXT,
  ADD COLUMN IF NOT EXISTS gred TEXT,
  ADD COLUMN IF NOT EXISTS telefon TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
