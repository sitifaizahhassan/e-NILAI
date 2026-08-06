import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUserRole } from "../lib/useUserRole";

const ROLES = ["guru", "pentadbir", "admin"];

export default function AdminUrusPenggunaPage() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      loadUsers();
    } else if (!roleLoading) {
      setLoading(false);
    }
  }, [roleLoading, isAdmin]);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nama, jawatan, role")
        .order("nama", { ascending: true });
      if (error) throw error;
      setUsers(data || []);
    } catch (e) {
      setMsg("Ralat memuatkan pengguna: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId, newRole) {
    setSavingId(userId);
    setMsg("");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      if (error) throw error;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setMsg("Peranan berjaya dikemas kini ✅");
    } catch (e) {
      setMsg("Ralat kemas kini peranan: " + e.message);
    } finally {
      setSavingId(null);
    }
  }

  if (roleLoading || loading) {
    return <div style={s.loading}>Memuatkan...</div>;
  }

  if (!isAdmin) {
    return (
      <div style={s.denied}>
        <div style={s.deniedIcon}>🚫</div>
        <h2 style={s.deniedTitle}>Akses Ditolak</h2>
        <p style={s.deniedText}>
          Halaman ini hanya boleh diakses oleh pengguna berperanan <strong>admin</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>👥 Urus Pengguna</h2>
        <p style={s.pageSubtitle}>Lihat dan tukar peranan semua pengguna sistem.</p>
      </div>

      {msg && (
        <div
          style={{
            ...s.msgBox,
            background: msg.includes("Ralat") ? "#fef2f2" : "#f0fdf4",
            borderColor: msg.includes("Ralat") ? "#fca5a5" : "#86efac",
            color: msg.includes("Ralat") ? "#dc2626" : "#16a34a",
          }}
        >
          {msg}
        </div>
      )}

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Nama</th>
              <th style={s.th}>Jawatan</th>
              <th style={s.th}>Peranan Semasa</th>
              <th style={s.th}>Tukar Peranan</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} style={s.emptyCell}>Tiada pengguna dijumpai.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} style={s.tr}>
                  <td style={s.td}>{user.nama || "—"}</td>
                  <td style={s.td}>{user.jawatan || "—"}</td>
                  <td style={s.td}>
                    <span style={{ ...s.roleBadge, ...getRoleBadgeStyle(user.role) }}>
                      {user.role || "guru"}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={s.actionRow}>
                      <select
                        style={s.roleSelect}
                        value={user.role || "guru"}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        disabled={savingId === user.id}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {savingId === user.id && (
                        <span style={s.savingText}>Menyimpan...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getRoleBadgeStyle(role) {
  if (role === "admin") return { background: "#fef3c7", color: "#92400e" };
  if (role === "pentadbir") return { background: "#dbeafe", color: "#1e40af" };
  return { background: "#f0fdf4", color: "#166534" };
}

const s = {
  page: { padding: "0 4px" },
  loading: { padding: 40, textAlign: "center", color: "#64748b" },
  denied: {
    textAlign: "center",
    padding: "60px 20px",
  },
  deniedIcon: { fontSize: 56, marginBottom: 16 },
  deniedTitle: { fontSize: 24, fontWeight: 700, color: "#dc2626", margin: "0 0 8px" },
  deniedText: { fontSize: 15, color: "#64748b", margin: 0 },
  pageHeader: { marginBottom: 20 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e3a5f" },
  pageSubtitle: { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  msgBox: {
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 16,
    fontSize: 14,
  },
  tableWrap: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  thead: {
    background: "#f8fafc",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 700,
    color: "#374151",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "10px 16px",
    color: "#374151",
    verticalAlign: "middle",
  },
  emptyCell: {
    padding: "24px 16px",
    textAlign: "center",
    color: "#9ca3af",
  },
  roleBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 600,
    fontSize: 12,
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  roleSelect: {
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
  },
  savingText: {
    fontSize: 12,
    color: "#6b7280",
  },
};
