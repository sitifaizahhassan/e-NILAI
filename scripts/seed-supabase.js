// scripts/seed-supabase.js
// Seed test users in Supabase Auth and profiles table
//
// Prerequisites:
//   npm install @supabase/supabase-js dotenv   (run from repo root)
//
// Set environment variables (in .env at repo root or via shell):
//   SUPABASE_URL           = https://<project-id>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY = <service_role key from Supabase API settings>
//
// Usage:
//   node scripts/seed-supabase.js

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
      "  SUPABASE_URL: project URL (e.g. https://xxxx.supabase.co)\n" +
      "  SUPABASE_SERVICE_ROLE_KEY: service_role key from Supabase → Settings → API"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_USERS = [
  {
    email: "admin@test.com",
    password: "Admin@123",
    nama: "Admin Test",
    role: "admin",
  },
  {
    email: "guru@test.com",
    password: "Guru@123",
    nama: "Guru Test",
    role: "guru",
  },
];

async function seedUser({ email, password, nama, role }) {
  // Create user in Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    // If user already exists, look up by email instead of failing
    if (authError.message?.includes("already been registered")) {
      console.log(`ℹ User already exists: ${email}`);
      const { data: listData, error: listError } =
        await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      const existing = listData.users.find((u) => u.email === email);
      if (!existing) throw new Error(`Could not find existing user ${email}`);
      return upsertProfile({ id: existing.id, email, nama, role });
    }
    throw authError;
  }

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  console.log(`✓ ${roleLabel} user created: ${email}`);

  return upsertProfile({ id: authData.user.id, email, nama, role });
}

async function upsertProfile({ id, email, nama, role }) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id,
      email,
      nama,
      role,
      created_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;

  console.log(`✓ Profile created for ${email}`);
}

async function main() {
  for (const user of TEST_USERS) {
    await seedUser(user);
  }
  console.log("✓ Seed completed successfully");
}

main().catch((err) => {
  console.error("✗ Seed failed:", err.message ?? err);
  process.exit(1);
});
