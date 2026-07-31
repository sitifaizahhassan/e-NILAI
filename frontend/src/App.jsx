import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import GuruLayout from "./layouts/GuruLayout";
import AdminControlPage from "./pages/AdminControlPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminKeberhasilanPage from "./pages/AdminKeberhasilanPage";
import AdminLaporanPage from "./pages/AdminLaporanPage";
import AdminStatusPage from "./pages/AdminStatusPage";
import GuidePage from "./pages/GuidePage";
import GuruDashboardPage from "./pages/GuruDashboardPage";
import GuruKeberhasilanPage from "./pages/GuruKeberhasilanPage";
import GuruProfilPage from "./pages/GuruProfilPage";
import KeberhasilanPrintablePage from "./pages/KeberhasilanPrintablePage";
import LoginPage from "./pages/LoginPage";
import PencerapanPage from "./pages/PencerapanPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route path="/guru" element={<GuruLayout />}>
        <Route index element={<GuruDashboardPage />} />
        <Route path="profil" element={<GuruProfilPage />} />
        <Route path="keberhasilan" element={<GuruKeberhasilanPage />} />
        <Route path="pencerapan-kendiri" element={<PencerapanPage variant="kendiri" />} />
        <Route path="pencerapan-1" element={<PencerapanPage variant="pertama" />} />
        <Route path="pencerapan-2" element={<PencerapanPage variant="kedua" />} />
        <Route path="panduan" element={<GuidePage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="profil" element={<GuruProfilPage />} />
        <Route path="keberhasilan" element={<GuruKeberhasilanPage />} />
        <Route path="pencerapan-kendiri" element={<PencerapanPage variant="kendiri" />} />
        <Route path="pencerapan-1" element={<PencerapanPage variant="pertama" />} />
        <Route path="pencerapan-2" element={<PencerapanPage variant="kedua" />} />
        <Route path="panduan" element={<GuidePage />} />
        <Route path="pelaporan" element={<AdminLaporanPage />} />
        <Route path="status" element={<AdminStatusPage />} />
        <Route path="kontrol-admin" element={<AdminControlPage />} />
        <Route path="semakan-keberhasilan" element={<AdminKeberhasilanPage />} />
      </Route>

      <Route path="/admin/keberhasilan/print/:formId" element={<KeberhasilanPrintablePage />} />
      <Route path="/guru/keberhasilan/print/:formId" element={<KeberhasilanPrintablePage />} />

      <Route path="*" element={<div style={{ padding: 20 }}>Page not found</div>} />
    </Routes>
  );
}

export default App;
