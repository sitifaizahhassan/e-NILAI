# Supabase Seed Script Guide (e-NILAI)

Panduan ini menerangkan cara jalankan seed script Supabase untuk cipta data pengguna ujian bagi projek e-NILAI.

## 1) Prerequisites

Pastikan semua ini tersedia sebelum mula:

- Node.js sudah dipasang
- `npm` atau `yarn` tersedia
- `SUPABASE_SERVICE_ROLE_KEY` sudah ditambah dalam fail `.env`
- Environment variables Supabase lain sudah dikonfigurasi (contohnya URL project)

Contoh minimum `.env`:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> Gunakan service role key yang betul dari Supabase Dashboard → **Settings** → **API Keys**.

---

## 2) Step-by-step Instructions

### Step A: Install dependencies

Di root repository:

```bash
npm install
```

Atau dengan yarn:

```bash
yarn install
```

### Step B: Run seed script

```bash
node scripts/seed-supabase.js
```

### Step C: Expected output

Output berjaya biasanya akan menunjukkan proses create user/profile tanpa error, contohnya:

```text
Seeding Supabase users...
Created/updated: admin@test.com
Created/updated: guru@test.com
Seed completed successfully.
```

### Step D: Verify script ran successfully

Semak perkara berikut:

1. Command tamat tanpa `Error` / stack trace
2. Kedua-dua test users wujud dalam Supabase Auth
3. (Jika script create profile/role) rekod berkaitan berjaya diwujudkan dalam table berkaitan

---

## 3) Test Users Created

Selepas seeding, guna akaun ini:

- `admin@test.com` / `Admin@123`
- `guru@test.com` / `Guru@123`

---

## 4) Troubleshooting

### Error: Missing environment variable

**Simptom:** mesej seperti `SUPABASE_SERVICE_ROLE_KEY is required` atau `SUPABASE_URL is missing`.

**Fix:**

- Semak `.env` wujud di root repository
- Pastikan nama variable tepat (huruf besar/kecil mesti sama)
- Restart terminal dan jalankan semula command

### Error: Invalid service role key / Unauthorized (401/403)

**Fix:**

- Copy semula key dari Supabase Dashboard → Settings → API Keys
- Pastikan anda guna **Service Role Key**, bukan anon key
- Pastikan key tidak ada ruang kosong tambahan

### Error: Network / fetch failed

**Fix:**

- Semak sambungan internet
- Pastikan `SUPABASE_URL` betul
- Cuba semula command selepas beberapa minit

### How to check logs

Jalankan script dengan log fail:

```bash
node scripts/seed-supabase.js 2>&1 | tee seed.log
```

Semak log:

```bash
tail -n 100 seed.log
```

---

## 5) Next Steps After Seeding

1. **Login dengan test users**
   - Buka aplikasi e-NILAI
   - Login guna `admin@test.com` atau `guru@test.com`
2. **Verify users in Supabase**
   - Supabase Dashboard → **Authentication** → **Users**
   - Pastikan dua akaun test wujud
3. **Test authentication flows**
   - Uji login berjaya
   - Uji route berdasarkan role (admin vs guru)
   - Uji error flow (contoh password salah / user tanpa akses)

Jika semua langkah di atas berjaya, seed script anda berfungsi dengan betul.
