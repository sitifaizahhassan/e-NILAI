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
      <h2 style={styles.logo}>e-Nilai</h2>
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
  logo: { margin: "0 0 24px 0", fontSize: 24 },
  nav: { display: "flex", flexDirection: "column", gap: 10 },
  navItem: { textDecoration: "none", padding: "8px 10px", borderRadius: 8 },
};