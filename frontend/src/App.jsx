import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminKeberhasilanPage from "./pages/AdminKeberhasilanPage";
import GuruKeberhasilanPage from "./pages/GuruKeberhasilanPage";
import KeberhasilanPrintablePage from "./pages/KeberhasilanPrintablePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="keberhasilan" element={<AdminKeberhasilanPage />} />
      </Route>

      {/* letak print route di luar AdminLayout */}
      <Route path="/admin/keberhasilan/print/:formId" element={<KeberhasilanPrintablePage />} />

      <Route path="/guru/keberhasilan" element={<GuruKeberhasilanPage />} />
      <Route path="/guru/keberhasilan/print/:formId" element={<KeberhasilanPrintablePage />} />

      <Route path="*" element={<div style={{ padding: 20 }}>Page not found</div>} />
    </Routes>
  );
}

export default App;