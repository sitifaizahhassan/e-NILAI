import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminCollections, getProfileLabel } from "../lib/admin";
import { getWorkflowLabel } from "../lib/navigation";
import { supabase } from "../lib/supabase";

const MODULES = [
  { key: "keberhasilan", label: "Keberhasilan", tableName: "keberhasilan_forms", idKey: "guru_id" },
  { key: "kendiri", label: "Pencerapan Kendiri", tableName: "pencerapan_kendiri", idKey: "user_id" },
  { key: "pertama", label: "Pencerapan 1", tableName: "pencerapan_1", idKey: "user_id" },
  { key: "kedua", label: "Pencerapan 2", tableName: "pencerapan_2", idKey: "user_id" },
];

export default function AdminStatusPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    setLoading(true);
    setMessage("");
    try {
      const collections = await fetchAdminCollections();
      const fallbackMap = Object.fromEntries(
        collections.keberhasilanForms.map((form) => [form.guru_id, form])
      );

      const nonAdminProfiles = collections.profiles.filter((profile) => profile.role !== "admin");
      const userIds = new Set([
        ...nonAdminProfiles.map((profile) => profile.id),
        ...collections.keberhasilanForms.map((form) => form.guru_id),
        ...collections.pencerapanKendiri.map((record) => record.user_id),
        ...collections.pencerapan1.map((record) => record.user_id),
        ...collections.pencerapan2.map((record) => record.user_id),
      ]);

      const nextRows = Array.from(userIds).map((userId) => {
        const profile = nonAdminProfiles.find((item) => item.id === userId) || { id: userId };
        return {
          userId,
          nama: getProfileLabel(profile, fallbackMap),
          no_kp: profile.no_kp || "-",
          keberhasilan: collections.keberhasilanForms.find((form) => form.guru_id === userId),
          kendiri: collections.pencerapanKendiri.find((record) => record.user_id === userId),
          pertama: collections.pencerapan1.find((record) => record.user_id === userId),
          kedua: collections.pencerapan2.find((record) => record.user_id === userId),
        };
      });

      setRows(nextRows);
    } catch (error) {
      console.error(error);
      setMessage(`Ralat memuatkan status borang: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function markReviewed(tableName, recordId) {
    if (!recordId) return;
    try {
      setMessage("");
      const { error } = await supabase
        .from(tableName)
        .update({ status: "reviewed", updated_at: new Date().toISOString() })
        .eq("id", recordId);

      if (error) throw error;
      setMessage("Status berjaya dikemaskini kepada reviewed.");
      await loadStatus();
    } catch (error) {
      console.error(error);
      setMessage(`Ralat kemaskini status: ${error.message}`);
    }
  }

  const totals = useMemo(
    () => ({
      guru: rows.length,
      lengkap: rows.filter((row) => MODULES.every((module) => row[module.key])).length,
    }),
    [rows]
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="cards-grid">
        <div className="stat-card" style={{ "--accent": "#2563eb" }}>
          <p>Jumlah Guru</p>
          <h3>{totals.guru}</h3>
        </div>
        <div className="stat-card" style={{ "--accent": "#10b981" }}>
          <p>Rekod Lengkap 4 Modul</p>
          <h3>{totals.lengkap}</h3>
        </div>
      </section>

      <section className="panel">
        <h2>Status Borang Guru</h2>
        <p className="sub">Pantau status keberhasilan dan tiga borang pencerapan bagi semua guru.</p>

        {loading ? (
          <div className="loading">Memuatkan status...</div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 960 }}>
              <thead>
                <tr>
                  <HeaderCell>Nama / ID</HeaderCell>
                  <HeaderCell>No KP</HeaderCell>
                  {MODULES.map((module) => (
                    <HeaderCell key={module.key}>{module.label}</HeaderCell>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.userId}>
                    <BodyCell>{row.nama}</BodyCell>
                    <BodyCell>{row.no_kp}</BodyCell>
                    {MODULES.map((module) => {
                      const record = row[module.key];
                      return (
                        <BodyCell key={`${row.userId}-${module.key}`}>
                          {!record ? (
                            <span>-</span>
                          ) : (
                            <div style={{ display: "grid", gap: 8 }}>
                              <strong>{getWorkflowLabel(record.status)}</strong>
                              <small>
                                {record.updated_at
                                  ? new Date(record.updated_at).toLocaleDateString("ms-MY")
                                  : "-"}
                              </small>
                              {module.tableName !== "keberhasilan_forms" && (
                                <button
                                  type="button"
                                  className="refresh-btn"
                                  onClick={() => markReviewed(module.tableName, record.id)}
                                >
                                  Tandakan Reviewed
                                </button>
                              )}
                            </div>
                          )}
                        </BodyCell>
                      );
                    })}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <BodyCell colSpan={MODULES.length + 2}>Tiada data status dijumpai.</BodyCell>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {message && <div className="dashboard-inline-alert">{message}</div>}
      </section>
    </div>
  );
}

function HeaderCell({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: 12,
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}
    >
      {children}
    </th>
  );
}

function BodyCell({ children, colSpan }) {
  return (
    <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", verticalAlign: "top" }} colSpan={colSpan}>
      {children}
    </td>
  );
}
