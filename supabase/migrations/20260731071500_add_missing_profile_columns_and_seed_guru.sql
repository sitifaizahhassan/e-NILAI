-- Add missing teacher profile fields to profiles and seed the requested test profile.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS no_kp text,
  ADD COLUMN IF NOT EXISTS jawatan text,
  ADD COLUMN IF NOT EXISTS gred text,
  ADD COLUMN IF NOT EXISTS opsyen text;

DO $$
DECLARE
  insert_columns text[] := ARRAY['id', 'role', 'no_kp', 'jawatan', 'gred', 'opsyen'];
  insert_values text[] := ARRAY[
    quote_literal('e154248a-e65a-480e-9d52-5d5d58344bf0'),
    quote_literal('guru'),
    quote_literal('876543210123'),
    quote_literal('Guru Sains'),
    quote_literal('DG41'),
    quote_literal('Sekolah Menengah')
  ];
  update_assignments text[] := ARRAY[
    'role = EXCLUDED.role',
    'no_kp = EXCLUDED.no_kp',
    'jawatan = EXCLUDED.jawatan',
    'gred = EXCLUDED.gred',
    'opsyen = EXCLUDED.opsyen'
  ];
  has_created_at boolean;
  has_updated_at boolean;
  upsert_sql text;
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'public.profiles table does not exist';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'created_at'
  )
  INTO has_created_at;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'updated_at'
  )
  INTO has_updated_at;

  IF has_created_at THEN
    insert_columns := insert_columns || 'created_at';
    insert_values := insert_values || 'timezone(''utc'', now())';
  END IF;

  IF has_updated_at THEN
    insert_columns := insert_columns || 'updated_at';
    insert_values := insert_values || 'timezone(''utc'', now())';
    update_assignments := update_assignments || 'updated_at = timezone(''utc'', now())';
  END IF;

  upsert_sql := format(
    'INSERT INTO public.profiles (%s) VALUES (%s) ON CONFLICT (id) DO UPDATE SET %s',
    array_to_string(insert_columns, ', '),
    array_to_string(insert_values, ', '),
    array_to_string(update_assignments, ', ')
  );

  EXECUTE upsert_sql;
END $$;

-- Verification queries to run in Supabase SQL Editor after applying this migration:
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'profiles'
--   AND column_name IN ('no_kp', 'jawatan', 'gred', 'opsyen')
-- ORDER BY column_name;
--
-- SELECT id, role, no_kp, jawatan, gred, opsyen
-- FROM public.profiles
-- WHERE id = 'e154248a-e65a-480e-9d52-5d5d58344bf0';
