import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { gunaAuth } from "../lib/AuthContext";

const STAIL = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "#0f172a",
    color: "white",
    gap: 16,
    flexWrap: "wrap",
  },
  pautan: {
    color: "white",
    textDecoration: "none",
    marginRight: 12,
  },
  butang: {
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    background: "#dc2626",
    color: "white",
    cursor: "pointer",
  },
};

export default function Navbar() {
  const navigate = useNavigate();
  const { peranan, keluar } = gunaAuth();

  async function klikKeluar() {
    await keluar();
    navigate("/login", { replace: true });
  }

  return (
    <header style={STAIL.bar}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <strong style={{ marginRight: 16 }}>e-NILAI</strong>
        {peranan === "admin" && (
          <>
            <Link style={STAIL.pautan} to="/admin">
              Dashboard
            </Link>
            <Link style={STAIL.pautan} to="/admin/keberhasilan">
              Keberhasilan
            </Link>
          </>
        )}

        {peranan === "guru" && (
          <>
            <Link style={STAIL.pautan} to="/guru">
              Dashboard
            </Link>
            <Link style={STAIL.pautan} to="/guru/keberhasilan">
              Keberhasilan
            </Link>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>Peranan: {peranan ?? "-"}</span>
        <button style={STAIL.butang} type="button" onClick={klikKeluar}>
          Keluar
        </button>
      </div>
    </header>
  );
}
