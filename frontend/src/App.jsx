import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import GuruLayout from "./layouts/GuruLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminKeberhasilanPage from "./pages/AdminKeberhasilanPage";
import GuruDashboardPage from "./pages/GuruDashboardPage";
import GuruProfilPage from "./pages/GuruProfilPage";
import GuruKeberhasilanPage from "./pages/GuruKeberhasilanPage";
import GuruPencerapanKendiriPage from "./pages/GuruPencerapanKendiriPage";
import GuruPencerapan1Page from "./pages/GuruPencerapan1Page";
import GuruPencerapan2Page from "./pages/GuruPencerapan2Page";
import GuruPanduanPage from "./pages/GuruPanduanPage";
import KeberhasilanPrintablePage from "./pages/KeberhasilanPrintablePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="keberhasilan" element={<AdminKeberhasilanPage />} />
      </Route>

      {/* Print routes outside layout */}
      <Route path="/admin/keberhasilan/print/:formId" element={<KeberhasilanPrintablePage />} />
      <Route path="/guru/keberhasilan/print/:formId" element={<KeberhasilanPrintablePage />} />

      <Route path="/guru" element={<GuruLayout />}>
        <Route index element={<GuruDashboardPage />} />
        <Route path="profil" element={<GuruProfilPage />} />
        <Route path="keberhasilan" element={<GuruKeberhasilanPage />} />
        <Route path="pencerapan-kendiri" element={<GuruPencerapanKendiriPage />} />
        <Route path="pencerapan-1" element={<GuruPencerapan1Page />} />
        <Route path="pencerapan-2" element={<GuruPencerapan2Page />} />
        <Route path="panduan" element={<GuruPanduanPage />} />
      </Route>

      <Route path="*" element={<div style={{ padding: 20 }}>Page not found</div>} />
    </Routes>
  );
}

export default App;
