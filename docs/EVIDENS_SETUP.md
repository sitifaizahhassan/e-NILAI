# Panduan Persediaan Evidens Keberhasilan

Dokumen ini menerangkan langkah-langkah untuk menyediakan Supabase Storage bucket dan polisi RLS bagi ciri muat naik evidens pada halaman Keberhasilan.

---

## 1. Jalankan Migrasi Pangkalan Data

Buka **Supabase Dashboard → SQL Editor → New Query**, kemudian salin dan jalankan kandungan fail:

```
supabase/migrations/20240101000000_tambah_evidens_keberhasilan.sql
```

Ini akan menambah dua lajur baharu pada jadual `keberhasilan_items`:
- `evidens_url`  — URL awam fail yang dimuat naik
- `evidens_path` — Laluan fail dalam bucket Storage

---

## 2. Cipta Bucket Supabase Storage

1. Buka **Supabase Dashboard → Storage → New bucket**
2. Nama bucket: `evidens-keberhasilan`
3. Pilih **Public bucket** (supaya URL awam boleh diakses)
4. Klik **Create bucket**

---

## 3. Tetapkan Polisi RLS Storage

Buka **Supabase Dashboard → Storage → Policies → evidens-keberhasilan**, kemudian tambah polisi berikut:

### Polisi INSERT (Muat Naik) — Guru yang log masuk boleh muat naik

```sql
CREATE POLICY "Guru boleh muat naik evidens"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidens-keberhasilan'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Polisi SELECT (Baca/Lihat) — Guru yang log masuk boleh baca fail mereka

```sql
CREATE POLICY "Guru boleh baca evidens mereka"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'evidens-keberhasilan'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Polisi DELETE (Buang) — Guru yang log masuk boleh buang fail mereka

```sql
CREATE POLICY "Guru boleh buang evidens mereka"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'evidens-keberhasilan'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

> **Nota:** Fail disimpan dengan laluan `{guru_id}/{form_id}-bil{bil}-{timestamp}-{nama_fail}`. Polisi di atas memastikan setiap guru hanya boleh mengurus fail dalam folder `{auth.uid()}` mereka sendiri.
>
> Jika bucket ditetapkan sebagai **Public**, polisi SELECT mungkin tidak diperlukan untuk melihat fail. Tetapi tambah polisi SELECT untuk kawalan akses yang lebih baik jika bucket ditukar kepada Private.

---

## 4. Pembolehubah Persekitaran

Pastikan fail `.env` (atau persekitaran deployment) mengandungi:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Tiada kunci baharu diperlukan — kunci `anon` sedia ada sudah mencukupi untuk operasi Storage yang dilindungi RLS.

---

## 5. Ujian

1. Log masuk sebagai guru
2. Buka halaman **Keberhasilan**
3. Isi Penilaian Pertama dan simpan
4. Klik butang **"Muat Naik"** pada lajur EVIDENS untuk setiap baris
5. Pilih mana-mana fail (semua jenis fail diterima)
6. Sahkan fail berjaya dimuat naik dan pautan dipaparkan
7. Selepas semua baris ada evidens, butang **"Hantar Penilaian Kedua"** akan menjadi aktif (enabled)
8. Klik butang tersebut untuk menghantar penilaian kedua
