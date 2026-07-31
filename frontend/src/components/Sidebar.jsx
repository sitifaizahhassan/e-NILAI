import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menus = [
    { label: "Dashboard", to: "/" },
    { label: "Pelajar", to: "/pelajar" },
    { label: "Markah", to: "/markah" },
    { label: "Laporan", to: "/laporan" },
    { label: "Tetapan", to: "/tetapan" },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* TODO: ganti dengan fail logo rasmi apabila disediakan */}
      <div style={styles.logoRow}>
        <div style={styles.logoIcon}>e</div>
        <h2 style={styles.logo}>e-NILAI</h2>
      </div>
      <nav style={styles.nav}>
        {menus.map((m) => (
          <NavLink
            key={m.label}
            to={m.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              background: isActive ? "rgba(37,99,235,0.35)" : "rgba(255,255,255,0.03)",
              color: isActive ? "#fff" : "#d1d5db",
            })}
          >
            {m.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: { width: 220, background: "#111827", color: "white", padding: "24px 16px" },
  logoRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 24 },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 15,
    flexShrink: 0,
  },
  logo: { margin: 0, fontSize: 20, fontWeight: 700 },
  nav: { display: "flex", flexDirection: "column", gap: 10 },
  navItem: { textDecoration: "none", padding: "8px 10px", borderRadius: 8 },
};