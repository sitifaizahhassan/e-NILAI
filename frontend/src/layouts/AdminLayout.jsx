import React from "react";
import { Link, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, background: "#111827", color: "white", padding: 16 }}>
        <h3>Admin</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <Link to="/admin" style={{ color: "white" }}>Dashboard</Link>
          <Link to="/admin/keberhasilan" style={{ color: "white" }}>Keberhasilan</Link>
        </div>
      </aside>
      <main style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: 20 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}