import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, background: "#111827", color: "white", padding: 16 }}>
        <h3>Admin</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <Link to="/admin" style={{ color: "white" }}>Dashboard</Link>
          <Link to="/admin/keberhasilan" style={{ color: "white" }}>Keberhasilan</Link>
          <Link to="/admin/pengguna" style={{ color: "white" }}>👥 Urus Pengguna</Link>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}