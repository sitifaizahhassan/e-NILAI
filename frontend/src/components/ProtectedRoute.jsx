import React from "react";
import { Navigate } from "react-router-dom";
import { gunaAuth } from "../lib/AuthContext";

export default function RuteLindingi({ children, perananDiperlukan }) {
  const { pengguna, peranan, sedangMuatkan } = gunaAuth();

  if (sedangMuatkan) {
    return <div style={{ padding: 20 }}>Sedang memuatkan...</div>;
  }

  if (!pengguna) {
    return <Navigate to="/login" replace />;
  }

  if (perananDiperlukan && peranan !== perananDiperlukan) {
    if (peranan === "admin") return <Navigate to="/admin" replace />;
    if (peranan === "guru") return <Navigate to="/guru" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
