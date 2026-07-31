export const GUIDE_PDF_PATH = "/guides/panduan-e-nilai.pdf";

export const GURU_MENU = [
  { label: "Dashboard", to: "/guru", end: true },
  { label: "Profil Guru", to: "/guru/profil" },
  { label: "Borang Keberhasilan", to: "/guru/keberhasilan" },
  { label: "Pencerapan Kendiri", to: "/guru/pencerapan-kendiri" },
  { label: "Pencerapan 1", to: "/guru/pencerapan-1" },
  { label: "Pencerapan Kedua", to: "/guru/pencerapan-2" },
  { label: "Panduan", to: "/guru/panduan" },
];

export const ADMIN_MENU = [
  { label: "Dashboard", to: "/admin", end: true },
  { label: "Profil Guru", to: "/admin/profil" },
  { label: "Borang Keberhasilan", to: "/admin/keberhasilan" },
  { label: "Pencerapan Kendiri", to: "/admin/pencerapan-kendiri" },
  { label: "Pencerapan 1", to: "/admin/pencerapan-1" },
  { label: "Pencerapan Kedua", to: "/admin/pencerapan-2" },
  { label: "Panduan", to: "/admin/panduan" },
  { label: "Pelaporan", to: "/admin/pelaporan" },
  { label: "Status", to: "/admin/status" },
  { label: "Kontrol Admin", to: "/admin/kontrol-admin" },
];

export const PENCERAPAN_FIELDS = [
  { key: "fokus_pencerapan", label: "Fokus Pencerapan", type: "textarea" },
  { key: "objektif_pembelajaran", label: "Objektif Pembelajaran", type: "textarea" },
  { key: "kekuatan_pengajaran", label: "Kekuatan / Amalan Baik", type: "textarea" },
  { key: "aspek_penambahbaikan", label: "Aspek Penambahbaikan", type: "textarea" },
  { key: "tindakan_susulan", label: "Tindakan Susulan", type: "textarea" },
  { key: "refleksi_guru", label: "Refleksi Guru", type: "textarea" },
  { key: "catatan_tambahan", label: "Catatan Tambahan", type: "textarea" },
];

export const PENCERAPAN_CONFIG = {
  kendiri: {
    tableName: "pencerapan_kendiri",
    title: "Pencerapan Kendiri",
    description: "Refleksi kendiri guru berdasarkan pengajaran semasa.",
  },
  pertama: {
    tableName: "pencerapan_1",
    title: "Pencerapan 1",
    description: "Pencerapan pertama menggunakan template standard yang sama.",
  },
  kedua: {
    tableName: "pencerapan_2",
    title: "Pencerapan Kedua",
    description: "Pencerapan kedua untuk semakan susulan dan penambahbaikan.",
  },
};

export function getUserDisplayName(profile, user) {
  return (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Pengguna"
  );
}

export function getWorkflowLabel(status) {
  const key = String(status || "draft").toUpperCase();
  if (key === "DRAFT") return "Draft";
  if (key === "SUBMITTED") return "Dihantar";
  if (key === "REVIEWED") return "Disemak";
  if (key === "DIHANTAR_1") return "Dihantar 1";
  if (key === "DINILAI_1") return "Dinilai 1";
  if (key === "DIHANTAR_2") return "Dihantar 2";
  if (key === "DINILAI_2") return "Dinilai 2";
  return String(status || "Draft");
}

export function getWorkflowTone(status) {
  const key = String(status || "draft").toUpperCase();
  if (key === "REVIEWED" || key.includes("DINILAI")) return "#059669";
  if (key === "SUBMITTED" || key.includes("DIHANTAR")) return "#2563eb";
  return "#64748b";
}

export function createEmptyPencerapanForm() {
  return PENCERAPAN_FIELDS.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});
}
