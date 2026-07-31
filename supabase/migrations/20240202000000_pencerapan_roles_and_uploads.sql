-- ============================================================
-- Migrasi: Sistem 3 Peranan, Muat Naik RPH/BBM, Ulasan Pentadbir
-- Jalankan SQL ini dalam Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tambah lajur baharu pada jadual pencerapan_kendiri
-- ------------------------------------------------------------
ALTER TABLE public.pencerapan_kendiri
  ADD COLUMN IF NOT EXISTS rph_url  TEXT,
  ADD COLUMN IF NOT EXISTS rph_path TEXT,
  ADD COLUMN IF NOT EXISTS bbm_url  TEXT,
  ADD COLUMN IF NOT EXISTS bbm_path TEXT;

COMMENT ON COLUMN public.pencerapan_kendiri.rph_url  IS 'URL awam fail RPH dalam bucket pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_kendiri.rph_path IS 'Laluan fail RPH dalam bucket Storage pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_kendiri.bbm_url  IS 'URL awam fail BBM dalam bucket pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_kendiri.bbm_path IS 'Laluan fail BBM dalam bucket Storage pencerapan-fail';

-- ------------------------------------------------------------
-- 2. Tambah lajur baharu pada jadual pencerapan_1
-- ------------------------------------------------------------
ALTER TABLE public.pencerapan_1
  ADD COLUMN IF NOT EXISTS rph_url  TEXT,
  ADD COLUMN IF NOT EXISTS rph_path TEXT,
  ADD COLUMN IF NOT EXISTS bbm_url  TEXT,
  ADD COLUMN IF NOT EXISTS bbm_path TEXT,
  ADD COLUMN IF NOT EXISTS ulasan   TEXT;

COMMENT ON COLUMN public.pencerapan_1.rph_url  IS 'URL awam fail RPH dalam bucket pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_1.rph_path IS 'Laluan fail RPH dalam bucket Storage pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_1.bbm_url  IS 'URL awam fail BBM dalam bucket pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_1.bbm_path IS 'Laluan fail BBM dalam bucket Storage pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_1.ulasan   IS 'Ulasan pentadbir bagi Pencerapan 1';

-- ------------------------------------------------------------
-- 3. Tambah lajur baharu pada jadual pencerapan_2
-- ------------------------------------------------------------
ALTER TABLE public.pencerapan_2
  ADD COLUMN IF NOT EXISTS rph_url  TEXT,
  ADD COLUMN IF NOT EXISTS rph_path TEXT,
  ADD COLUMN IF NOT EXISTS bbm_url  TEXT,
  ADD COLUMN IF NOT EXISTS bbm_path TEXT,
  ADD COLUMN IF NOT EXISTS ulasan   TEXT;

COMMENT ON COLUMN public.pencerapan_2.rph_url  IS 'URL awam fail RPH dalam bucket pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_2.rph_path IS 'Laluan fail RPH dalam bucket Storage pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_2.bbm_url  IS 'URL awam fail BBM dalam bucket pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_2.bbm_path IS 'Laluan fail BBM dalam bucket Storage pencerapan-fail';
COMMENT ON COLUMN public.pencerapan_2.ulasan   IS 'Ulasan pentadbir bagi Pencerapan 2';

-- ------------------------------------------------------------
-- 4. Pastikan profiles.role menyokong nilai baharu 'pentadbir'
--    (Jika ada CHECK constraint lama, kemas kini. Jika tiada, biarkan.)
-- ------------------------------------------------------------
-- Semak sama ada constraint wujud sebelum menambah/mengganti:
DO $$
BEGIN
  -- Buang constraint lama jika ada (nama mungkin berbeza)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles'
      AND constraint_type = 'CHECK'
      AND constraint_name LIKE '%role%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.profiles DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'profiles'
        AND constraint_type = 'CHECK'
        AND constraint_name LIKE '%role%'
      LIMIT 1
    );
  END IF;
END $$;

-- Tambah constraint baharu yang merangkumi 3 peranan
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('guru', 'pentadbir', 'admin'));

-- ------------------------------------------------------------
-- 5. Fungsi bantu: semak peranan pengguna semasa
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Beri kebenaran kepada authenticated users untuk memanggil fungsi ini
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- ------------------------------------------------------------
-- 6. RLS untuk jadual pencerapan_kendiri
-- ------------------------------------------------------------
ALTER TABLE public.pencerapan_kendiri ENABLE ROW LEVEL SECURITY;

-- Buang polisi lama jika ada
DROP POLICY IF EXISTS "pencerapan_kendiri_select" ON public.pencerapan_kendiri;
DROP POLICY IF EXISTS "pencerapan_kendiri_insert" ON public.pencerapan_kendiri;
DROP POLICY IF EXISTS "pencerapan_kendiri_update" ON public.pencerapan_kendiri;
DROP POLICY IF EXISTS "pencerapan_kendiri_delete" ON public.pencerapan_kendiri;

-- SELECT: pemilik boleh baca sendiri; pentadbir/admin boleh baca semua
CREATE POLICY "pencerapan_kendiri_select" ON public.pencerapan_kendiri
  FOR SELECT TO authenticated
  USING (
    guru_id = auth.uid()
    OR public.current_user_role() IN ('pentadbir', 'admin')
  );

-- INSERT: hanya pemilik (guru_id = auth.uid())
CREATE POLICY "pencerapan_kendiri_insert" ON public.pencerapan_kendiri
  FOR INSERT TO authenticated
  WITH CHECK (guru_id = auth.uid());

-- UPDATE: hanya pemilik boleh kemas kini rekod sendiri
CREATE POLICY "pencerapan_kendiri_update" ON public.pencerapan_kendiri
  FOR UPDATE TO authenticated
  USING (guru_id = auth.uid())
  WITH CHECK (guru_id = auth.uid());

-- DELETE: hanya pemilik
CREATE POLICY "pencerapan_kendiri_delete" ON public.pencerapan_kendiri
  FOR DELETE TO authenticated
  USING (guru_id = auth.uid());

-- ------------------------------------------------------------
-- 7. RLS untuk jadual pencerapan_1
-- ------------------------------------------------------------
ALTER TABLE public.pencerapan_1 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pencerapan_1_select" ON public.pencerapan_1;
DROP POLICY IF EXISTS "pencerapan_1_insert" ON public.pencerapan_1;
DROP POLICY IF EXISTS "pencerapan_1_update" ON public.pencerapan_1;
DROP POLICY IF EXISTS "pencerapan_1_delete" ON public.pencerapan_1;

-- SELECT: pemilik (guru) boleh lihat sendiri; pentadbir/admin boleh lihat semua
CREATE POLICY "pencerapan_1_select" ON public.pencerapan_1
  FOR SELECT TO authenticated
  USING (
    guru_id = auth.uid()
    OR public.current_user_role() IN ('pentadbir', 'admin')
  );

-- INSERT: hanya pentadbir/admin boleh cipta rekod baru
CREATE POLICY "pencerapan_1_insert" ON public.pencerapan_1
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('pentadbir', 'admin'));

-- UPDATE: hanya pentadbir/admin boleh kemas kini
CREATE POLICY "pencerapan_1_update" ON public.pencerapan_1
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('pentadbir', 'admin'))
  WITH CHECK (public.current_user_role() IN ('pentadbir', 'admin'));

-- DELETE: hanya pentadbir/admin
CREATE POLICY "pencerapan_1_delete" ON public.pencerapan_1
  FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('pentadbir', 'admin'));

-- ------------------------------------------------------------
-- 8. RLS untuk jadual pencerapan_2
-- ------------------------------------------------------------
ALTER TABLE public.pencerapan_2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pencerapan_2_select" ON public.pencerapan_2;
DROP POLICY IF EXISTS "pencerapan_2_insert" ON public.pencerapan_2;
DROP POLICY IF EXISTS "pencerapan_2_update" ON public.pencerapan_2;
DROP POLICY IF EXISTS "pencerapan_2_delete" ON public.pencerapan_2;

-- SELECT: pemilik (guru) boleh lihat sendiri; pentadbir/admin boleh lihat semua
CREATE POLICY "pencerapan_2_select" ON public.pencerapan_2
  FOR SELECT TO authenticated
  USING (
    guru_id = auth.uid()
    OR public.current_user_role() IN ('pentadbir', 'admin')
  );

-- INSERT: hanya pentadbir/admin
CREATE POLICY "pencerapan_2_insert" ON public.pencerapan_2
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('pentadbir', 'admin'));

-- UPDATE: hanya pentadbir/admin
CREATE POLICY "pencerapan_2_update" ON public.pencerapan_2
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('pentadbir', 'admin'))
  WITH CHECK (public.current_user_role() IN ('pentadbir', 'admin'));

-- DELETE: hanya pentadbir/admin
CREATE POLICY "pencerapan_2_delete" ON public.pencerapan_2
  FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('pentadbir', 'admin'));

-- ------------------------------------------------------------
-- 9. RLS untuk profiles — kawalan urus peranan
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_role_admin" ON public.profiles;

-- SELECT: semua pengguna boleh baca profil sendiri
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- SELECT: admin boleh baca semua profil (untuk halaman Urus Pengguna)
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.current_user_role() = 'admin');

-- UPDATE: pengguna boleh kemas kini profil sendiri (BUKAN lajur role)
-- Nota: Kawalan lajur halus (column-level security) dikuatkuasakan di lapisan aplikasi.
-- Untuk kuatkuasa penuh di DB, guna trigger atau fungsi terpisah.
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- UPDATE: admin boleh kemas kini mana-mana profil (termasuk lajur role)
CREATE POLICY "profiles_update_role_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- ============================================================
-- NOTA STORAGE (jalankan secara berasingan dalam SQL Editor):
-- ============================================================
-- Bucket 'pencerapan-fail' perlu dicipta dahulu melalui
-- Supabase Dashboard → Storage → New bucket (Public bucket).
-- Kemudian tambah polisi Storage berikut:

-- Storage INSERT (Muat Naik) — authenticated users
-- CREATE POLICY "pencerapan_fail_insert"
-- ON storage.objects FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'pencerapan-fail');

-- Storage SELECT (Baca/Lihat) — authenticated users
-- CREATE POLICY "pencerapan_fail_select"
-- ON storage.objects FOR SELECT TO authenticated
-- USING (bucket_id = 'pencerapan-fail');

-- Storage DELETE (Buang) — authenticated users
-- CREATE POLICY "pencerapan_fail_delete"
-- ON storage.objects FOR DELETE TO authenticated
-- USING (bucket_id = 'pencerapan-fail');
-- ============================================================
