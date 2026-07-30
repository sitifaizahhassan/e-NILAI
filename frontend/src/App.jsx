import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RuteLindingi from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import GuruLayout from "./layouts/GuruLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminKeberhasilanPage from "./pages/AdminKeberhasilanPage";
import GuruDashboardPage from "./pages/GuruDashboardPage";
import GuruKeberhasilanPage from "./pages/GuruKeberhasilanPage";
import KeberhasilanPrintablePage from "./pages/KeberhasilanPrintablePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route
        path="/admin"
        element={
          <RuteLindingi perananDiperlukan="admin">
            <AdminLayout />
          </RuteLindingi>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="keberhasilan" element={<AdminKeberhasilanPage />} />
      </Route>

      <Route
        path="/admin/keberhasilan/print/:formId"
        element={
          <RuteLindingi perananDiperlukan="admin">
            <KeberhasilanPrintablePage />
          </RuteLindingi>
        }
      />

      <Route
        path="/guru"
        element={
          <RuteLindingi perananDiperlukan="guru">
            <GuruLayout />
          </RuteLindingi>
        }
      >
        <Route index element={<GuruDashboardPage />} />
        <Route path="keberhasilan" element={<GuruKeberhasilanPage />} />
      </Route>

      <Route
        path="/guru/keberhasilan/print/:formId"
        element={
          <RuteLindingi perananDiperlukan="guru">
            <KeberhasilanPrintablePage />
          </RuteLindingi>
        }
      />

      <Route path="*" element={<div style={{ padding: 20 }}>Halaman tidak dijumpai</div>} />
    </Routes>
  );
}

export default App;