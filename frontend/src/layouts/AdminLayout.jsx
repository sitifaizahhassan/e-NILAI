import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, background: "#111827", color: "white", padding: 16 }}>
        {/* TODO: ganti dengan fail logo rasmi apabila disediakan */}
        <div style={adminStyles.logoRow}>
          <div style={adminStyles.logoIcon}>e</div>
          <h3 style={adminStyles.logoText}>e-NILAI</h3>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <Link to="/admin" style={{ color: "white" }}>Dashboard</Link>
          <Link to="/admin/keberhasilan" style={{ color: "white" }}>Keberhasilan</Link>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}

const adminStyles = {
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
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
  logoText: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
  },
};