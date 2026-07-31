import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Outlet, NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/guru", label: "🏠 Dashboard", exact: true },
  { to: "/guru/profil", label: "👤 Profil Guru" },
  { to: "/guru/keberhasilan", label: "🎯 Keberhasilan" },
  { to: "/guru/pencerapan-kendiri", label: "🔍 Pencerapan Kendiri" },
  { to: "/guru/pencerapan-1", label: "📋 Pencerapan 1" },
  { to: "/guru/pencerapan-2", label: "📝 Pencerapan 2" },
  { to: "/guru/panduan", label: "📘 Panduan" },
];

export default function GuruLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      const { data } = await supabase
        .from("profiles")
        .select("nama, email, jawatan, role")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(data || { email: user.email });
    } catch {
      // ignore
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <aside style={{ ...s.sidebar, left: sidebarOpen ? 0 : undefined }}>
        <div style={s.sidebarTop}>
          <div style={s.logo}>
            <span style={s.logoIcon}>📊</span>
            <span>e-NILAI</span>
          </div>
          <button
            style={s.closeMobile}
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            ✕
          </button>
        </div>

        {profile && (
          <div style={s.profileMini}>
            <div style={s.profileAvatar}>
              {(profile.nama || profile.email || "G").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={s.profileName}>{profile.nama || profile.email}</div>
              <div style={s.profileRole}>{profile.jawatan || "Guru"}</div>
            </div>
          </div>
        )}

        <nav style={s.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                style={{
                  ...s.navItem,
                  background: isActive ? "rgba(96,165,250,0.2)" : "transparent",
                  color: isActive ? "#93c5fd" : "#d1d5db",
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button style={s.logoutBtn} onClick={handleLogout}>
          🚪 Log Keluar
        </button>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div style={s.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div style={s.mainWrap}>
        {/* Top bar (mobile) */}
        <header style={s.topbar}>
          <button
            style={s.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            ☰
          </button>
          <span style={s.topbarTitle}>e-NILAI Guru</span>
          <div style={s.topbarRight}>
            {profile?.nama || profile?.email || ""}
          </div>
        </header>

        <main style={s.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const SIDEBAR_WIDTH = 240;

const s = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f6fb",
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    minWidth: SIDEBAR_WIDTH,
    background: "#111827",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    zIndex: 100,
    flexShrink: 0,
  },
  sidebarTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 16px 12px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
  },
  logoIcon: {
    fontSize: 24,
  },
  closeMobile: {
    display: "none",
    background: "none",
    border: "none",
    color: "#9ca3af",
    fontSize: 18,
    cursor: "pointer",
  },
  profileMini: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 8,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#3b82f6",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  profileName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f9fafb",
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  profileRole: {
    fontSize: 11,
    color: "#9ca3af",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "8px 10px",
    flex: 1,
  },
  navItem: {
    textDecoration: "none",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 14,
    display: "block",
    transition: "background 0.15s, color 0.15s",
  },
  logoutBtn: {
    margin: "8px 10px 16px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#d1d5db",
    borderRadius: 8,
    padding: "9px 12px",
    cursor: "pointer",
    fontSize: 14,
    textAlign: "left",
  },
  mainWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  topbar: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  menuBtn: {
    background: "none",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
    color: "#374151",
    display: "none",
    padding: "2px 4px",
  },
  topbarTitle: {
    fontWeight: 700,
    fontSize: 16,
    color: "#1e3a5f",
  },
  topbarRight: {
    marginLeft: "auto",
    fontSize: 13,
    color: "#64748b",
  },
  main: {
    flex: 1,
    padding: "24px 24px",
    maxWidth: 1100,
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  overlay: {
    display: "none",
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 99,
  },
};