# Panduan Persediaan Pencerapan: 3 Peranan, RPH/BBM & Ulasan

Dokumen ini menerangkan langkah-langkah untuk menyediakan sistem tiga peranan, muat naik RPH & BBM, ruangan Ulasan Pentadbir, dan halaman Urus Pengguna.

---

## Gambaran Keseluruhan Sistem Peranan

| Peranan | Isi Borang Sendiri | Nilai P1 & P2 Guru Lain | Upload RPH/BBM (P1/P2) | Urus Pengguna |
|---------|:---:|:---:|:---:|:---:|
| `guru` | ✅ | ❌ (lihat sahaja) | ❌ | ❌ |
| `pentadbir` | ✅ | ✅ | ✅ | ❌ |
| `admin` | ✅ | ✅ | ✅ | ✅ |

- **Pencerapan Kendiri**: guru pemilik boleh isi & upload RPH/BBM sendiri.
- **Pencerapan 1 & 2**: pentadbir/admin boleh isi skor, upload RPH/BBM, tulis Ulasan; guru hanya **lihat sahaja**.

---

## 1. Jalankan Migrasi Pangkalan Data

Buka **Supabase Dashboard → SQL Editor → New Query**, salin dan jalankan kandungan fail:

```
supabase/migrations/20240202000000_pencerapan_roles_and_uploads.sql
```

Migrasi ini akan:
- Tambah lajur `rph_url`, `rph_path`, `bbm_url`, `bbm_path` pada ketiga-tiga jadual pencerapan.
- Tambah lajur `ulasan` pada `pencerapan_1` dan `pencerapan_2`.
- Kemas kini CHECK constraint pada `profiles.role` untuk menyokong nilai `guru`, `pentadbir`, `admin`.
- Cipta fungsi bantu `public.current_user_role()`.
- Dayakan RLS dan tetapkan polisi akses pada semua jadual pencerapan dan `profiles`.

---

## 2. Cipta Bucket Supabase Storage

1. Buka **Supabase Dashboard → Storage → New bucket**
2. Nama bucket: **`pencerapan-fail`**
3. Pilih **Public bucket** (supaya URL awam boleh diakses)
4. Klik **Create bucket**

---

## 3. Tetapkan Polisi RLS Storage

Buka **Supabase Dashboard → Storage → Policies → pencerapan-fail** (atau guna SQL Editor), kemudian tambah polisi berikut:

### Polisi INSERT (Muat Naik) — Pengguna yang log masuk boleh muat naik

```sql
CREATE POLICY "pencerapan_fail_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pencerapan-fail');
```

### Polisi SELECT (Baca/Lihat) — Pengguna yang log masuk boleh baca

```sql
CREATE POLICY "pencerapan_fail_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'pencerapan-fail');
```

### Polisi DELETE (Buang) — Pengguna yang log masuk boleh buang

```sql
CREATE POLICY "pencerapan_fail_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pencerapan-fail');
```

> **Nota Keselamatan:** Kawalan halus muat naik (siapa boleh upload RPH/BBM pada borang mana) dikuatkuasakan di **lapisan aplikasi** (frontend) DAN di **RLS jadual** pencerapan (pentadbir/admin sahaja boleh INSERT/UPDATE pada `pencerapan_1` dan `pencerapan_2`). Polisi Storage di atas memberikan akses am kepada semua pengguna yang log masuk, tetapi operasi simpan URL ke DB dikuatkuasakan oleh RLS.

---

## 4. Kemas Kini Peranan Pengguna Sedia Ada

Pengguna sedia ada dalam jadual `profiles` yang mempunyai nilai `role` di luar `guru`, `pentadbir`, `admin` perlu dikemas kini sebelum constraint baru dijalankan. Jalankan dulu:

```sql
-- Kemas kini mana-mana nilai role yang tidak dikenali kepada 'guru'
UPDATE public.profiles
SET role = 'guru'
WHERE role IS NULL OR role NOT IN ('guru', 'pentadbir', 'admin');
```

Kemudian baru jalankan migrasi utama.

---

## 5. Tetapkan Peranan Admin Pertama

Selepas migrasi, tetapkan sekurang-kurangnya satu pengguna sebagai `admin` untuk boleh mengakses halaman Urus Pengguna:

```sql
-- Gantikan 'admin@sekolah.edu.my' dengan email admin anda
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@sekolah.edu.my';
```

---

## 6. Halaman Urus Pengguna (`/admin/pengguna`)

- Boleh diakses melalui menu Admin → **👥 Urus Pengguna**
- Hanya pengguna berperanan `admin` boleh melihat dan menggunakan halaman ini
- Bukan-admin akan melihat mesej **"Akses Ditolak"**
- Admin boleh menukar peranan setiap pengguna antara `guru`, `pentadbir`, `admin`

---

## 7. Pembolehubah Persekitaran

Pastikan fail `.env` (atau persekitaran deployment) mengandungi:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Tiada kunci baharu diperlukan — kunci `anon` sedia ada sudah mencukupi.

---

## 8. Aliran Kerja Pengguna

### Guru Biasa
1. Log masuk → diarahkan ke `/guru`
2. Boleh isi **Pencerapan Kendiri** (termasuk upload RPH & BBM sendiri)
3. Buka **Pencerapan 1 & 2** → hanya boleh **LIHAT** skor, RPH, BBM, dan Ulasan Pentadbir

### Pentadbir
1. Log masuk → diarahkan ke `/guru` (sama seperti guru, tetapi dengan kuasa tambahan)
2. Boleh isi semua borang sendiri (Kendiri, Keberhasilan, dll)
3. Buka **Pencerapan 1 & 2** → pilih guru dari dropdown, isi skor, upload RPH/BBM, tulis Ulasan
4. **TIDAK** boleh akses halaman Urus Pengguna

### Admin
1. Log masuk → diarahkan ke `/admin`
2. Akses penuh seperti pentadbir (termasuk nilai P1/P2 untuk guru)
3. Boleh akses **`/admin/pengguna`** untuk urus peranan semua pengguna

---

## 9. Struktur Fail Storage

Fail RPH & BBM disimpan dalam bucket `pencerapan-fail` dengan struktur:

```
pencerapan-fail/
  {guru_id}/
    kendiri/
      rph-{timestamp}-{nama_fail}
      bbm-{timestamp}-{nama_fail}
    pencerapan_1/
      rph-{timestamp}-{nama_fail}
      bbm-{timestamp}-{nama_fail}
    pencerapan_2/
      rph-{timestamp}-{nama_fail}
      bbm-{timestamp}-{nama_fail}
```

---

## 10. Ujian

### Sebagai Guru
1. Log masuk sebagai guru biasa
2. Buka Pencerapan Kendiri → isi borang, upload RPH & BBM → simpan
3. Buka Pencerapan 1 → **tidak** boleh isi skor, tiada butang simpan/hantar, tidak boleh upload
4. Cuba akses `/admin/pengguna` → terima mesej "Akses Ditolak"

### Sebagai Pentadbir
1. Log masuk sebagai pentadbir
2. Buka Pencerapan 1 → pilih guru dari dropdown → isi skor, upload RPH/BBM, tulis Ulasan → simpan
3. Cuba akses `/admin/pengguna` → terima mesej "Akses Ditolak"

### Sebagai Admin
1. Log masuk sebagai admin → diarahkan ke `/admin`
2. Klik "👥 Urus Pengguna" → lihat semua pengguna, tukar peranan
3. Akses `/guru/pencerapan-1` (melalui navigation) → pilih guru, isi borang seperti pentadbir
