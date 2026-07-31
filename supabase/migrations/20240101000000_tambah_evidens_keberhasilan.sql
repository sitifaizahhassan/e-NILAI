-- Migrasi: Tambah lajur evidens pada jadual keberhasilan_items
-- Jalankan SQL ini dalam Supabase SQL Editor

ALTER TABLE keberhasilan_items
  ADD COLUMN IF NOT EXISTS evidens_url  TEXT,
  ADD COLUMN IF NOT EXISTS evidens_path TEXT;

-- Kemas kini nilai sedia ada kepada NULL (sudah default NULL, sekadar dokumentasi)
-- UPDATE keberhasilan_items SET evidens_url = NULL, evidens_path = NULL WHERE evidens_url IS NULL;

COMMENT ON COLUMN keberhasilan_items.evidens_url  IS 'URL awam fail evidens yang dimuat naik ke Supabase Storage (bucket: evidens-keberhasilan)';
COMMENT ON COLUMN keberhasilan_items.evidens_path IS 'Laluan (path) fail evidens dalam bucket Supabase Storage evidens-keberhasilan';
