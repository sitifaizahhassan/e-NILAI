import React from "react";
import DashboardShell from "../components/DashboardShell";
import { ADMIN_MENU } from "../lib/navigation";

export default function AdminLayout() {
  return (
    <DashboardShell
      title="Dashboard Admin"
      subtitle="Akses lengkap untuk pengurusan guru, borang, pelaporan dan kawalan pentadbir."
      menus={ADMIN_MENU}
      requiredRole="admin"
    />
  );
}
