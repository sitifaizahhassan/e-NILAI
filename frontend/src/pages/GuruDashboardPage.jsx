import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const MENU_CARDS = [
  {
    to: "/guru/profil",
    icon: "👤",
    title: "Profil Guru",
    desc: "Lihat dan kemaskini maklumat profil",
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    to: "/guru/keberhasilan",
    icon: "🎯",
    title: "Borang Keberhasilan",
    desc: "Isi dan hantar borang sasaran keberhasilan",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    to: "/guru/pencerapan-kendiri",
    icon: "🔍",
    title: "Pencerapan Kendiri",
    desc: "Penilaian kendiri TAPAK STANDARD 4",
    color: "#7c3aed",
    bg: "#faf5ff",
  },
  {
    to: "/guru/pencerapan-1",
    icon: "📋",
    title: "Pencerapan 1",
    desc: "Borang pencerapan formal pertama",
    color: "#d97706",
    bg: "#fefce8",
  },
  {
    to: "/guru/pencerapan-2",
    icon: "📝",
    title: "Pencerapan 2",
    desc: "Borang pencerapan formal kedua",
    color: "#dc2626",
    bg: "#fef2f2",
  },
  {
    to: "/guru/panduan",
    icon: "📘",
    title: "Panduan",
    desc: "Cara penggunaan borang pencerapan",
    color: "#0891b2",
    bg: "#ecfeff",
  },
];

export default function GuruDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(data || { email: user.email });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrap}>
      {/* Welcome Banner */}
      <div style={s.banner}>
        <div>
          <h2 style={s.bannerTitle}>
            Selamat Datang ke e-NILAI 👋
          </h2>
          {loading ? (
            <p style={s.bannerSub}>Memuatkan profil...</p>
          ) : (
            <p style={s.bannerSub}>
              {profile?.nama || profile?.email || "Guru"} •{" "}
              {profile?.jawatan || "Guru"} •{" "}
              {profile?.opsyen || ""}
            </p>
          )}
        </div>
        <div style={s.bannerIcon}>🏫</div>
      </div>

      {/* Navigation Cards */}
      <h3 style={s.sectionTitle}>Menu Utama</h3>
      <div style={s.cardGrid}>
        {MENU_CARDS.map((m) => (
          <Link key={m.to} to={m.to} style={s.link}>
            <div style={{ ...s.menuCard, borderColor: m.color + "30" }}>
              <div style={{ ...s.menuIcon, background: m.bg, color: m.color }}>
                {m.icon}
              </div>
              <div>
                <div style={{ ...s.menuTitle, color: m.color }}>{m.title}</div>
                <div style={s.menuDesc}>{m.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Panel */}
      <div style={s.infoBox}>
        <strong>ℹ️ Maklumat:</strong> Sistem e-NILAI menggunakan{" "}
        <strong>TAPAK STANDARD 4 SKPM Kualiti@Sekolah</strong> untuk penilaian
        Pembelajaran dan Pemudahcaraan (PdPc). Terdapat 6 aspek penilaian dengan
        jumlah wajaran 100%.
      </div>
    </div>
  );
}

const s = {
  wrap: {
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
  },
  banner: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
    color: "#fff",
    borderRadius: 14,
    padding: "24px 28px",
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
  },
  bannerSub: {
    margin: "6px 0 0",
    opacity: 0.85,
    fontSize: 14,
  },
  bannerIcon: {
    fontSize: 48,
  },
  sectionTitle: {
    margin: "0 0 14px",
    fontSize: 16,
    fontWeight: 700,
    color: "#1e293b",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 14,
    marginBottom: 20,
  },
  link: {
    textDecoration: "none",
  },
  menuCard: {
    background: "#fff",
    border: "1px solid",
    borderRadius: 12,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
    transition: "box-shadow 0.15s, transform 0.15s",
    cursor: "pointer",
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  menuTitle: {
    fontWeight: 700,
    fontSize: 15,
  },
  menuDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  infoBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 1.6,
  },
};
