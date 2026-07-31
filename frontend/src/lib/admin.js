import { supabase } from "./supabase";

export function normalizeStatus(status) {
  const value = String(status || "draft").toUpperCase();
  if (value === "DRAFT") return "draft";
  if (value === "SUBMITTED" || value.includes("DIHANTAR")) return "submitted";
  if (value === "REVIEWED" || value.includes("DINILAI")) return "reviewed";
  return "draft";
}

export async function fetchAdminCollections() {
  const [
    profilesRes,
    keberhasilanRes,
    kendiriRes,
    pertamaRes,
    keduaRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("keberhasilan_forms").select("id, guru_id, status, updated_at, created_at, nama_pyd, tahun"),
    supabase.from("pencerapan_kendiri").select("id, user_id, status, updated_at, created_at"),
    supabase.from("pencerapan_1").select("id, user_id, status, updated_at, created_at"),
    supabase.from("pencerapan_2").select("id, user_id, status, updated_at, created_at"),
  ]);

  for (const result of [profilesRes, keberhasilanRes, kendiriRes, pertamaRes, keduaRes]) {
    if (result.error) throw result.error;
  }

  return {
    profiles: profilesRes.data || [],
    keberhasilanForms: keberhasilanRes.data || [],
    pencerapanKendiri: kendiriRes.data || [],
    pencerapan1: pertamaRes.data || [],
    pencerapan2: keduaRes.data || [],
  };
}

export function getProfileLabel(profile, fallbackMap = {}) {
  if (!profile) return "Pengguna";
  return (
    profile.full_name ||
    profile.nama ||
    profile.email ||
    fallbackMap[profile.id]?.nama_pyd ||
    profile.id
  );
}

export function buildModuleSummary(rows) {
  return rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc[normalizeStatus(row.status)] += 1;
      return acc;
    },
    { total: 0, draft: 0, submitted: 0, reviewed: 0 }
  );
}
