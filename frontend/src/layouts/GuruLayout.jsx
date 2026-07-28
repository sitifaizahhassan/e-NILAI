import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function GuruLayout() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}