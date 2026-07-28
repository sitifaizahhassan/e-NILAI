import React from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Outlet, Link } from "react-router-dom";

export default function GuruLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Guru Panel</h2>

      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/guru">Dashboard</Link>
        <Link to="/guru/keberhasilan">Keberhasilan</Link>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <Outlet />
    </div>
  );
}