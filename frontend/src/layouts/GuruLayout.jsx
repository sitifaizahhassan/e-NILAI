import React from "react";
import DashboardShell from "../components/DashboardShell";
import { GURU_MENU } from "../lib/navigation";

export default function GuruLayout() {
  return (
    <DashboardShell
      title="Dashboard Guru"
      subtitle="Lengkapkan profil, borang keberhasilan, pencerapan dan panduan guru di satu tempat."
      menus={GURU_MENU}
    />
  );
}
