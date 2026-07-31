import React, { useEffect, useMemo, useState } from "react";
import { buildModuleSummary, fetchAdminCollections } from "../lib/admin";

const MODULE_DEFINITIONS = [
  { key: "keberhasilan", label: "Borang Keberhasilan" },
  { key: "kendiri", label: "Pencerapan Kendiri" },
  { key: "pertama", label: "Pencerapan 1" },
  { key: "kedua", label: "Pencerapan Kedua" },
];

export default function AdminLaporanPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [collections, setCollections] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    setMessage("");
    try {
      setCollections(await fetchAdminCollections());
    } catch (error) {
      console.error(error);
      setMessage(`Ralat memuatkan pelaporan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const modules = useMemo(() => {
    if (!collections) {
      return {
        keberhasilan: { total: 0, draft: 0, submitted: 0, reviewed: 0 },
        kendiri: { total: 0, draft: 0, submitted: 0, reviewed: 0 },
        pertama: { total: 0, draft: 0, submitted: 0, reviewed: 0 },
        kedua: { total: 0, draft: 0, submitted: 0, reviewed: 0 },
      };
    }

    return {
      keberhasilan: buildModuleSummary(collections.keberhasilanForms),
      kendiri: buildModuleSummary(collections.pencerapanKendiri),
      pertama: buildModuleSummary(collections.pencerapan1),
      kedua: buildModuleSummary(collections.pencerapan2),
    };
  }, [collections]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel">
        <h2>Pelaporan Keseluruhan</h2>
        <p className="sub">Statistik ringkas bagi semua modul yang diisi oleh guru dan admin.</p>
        <button className="refresh-btn" type="button" onClick={loadReports} style={{ marginTop: 16 }}>
          Muat Semula Data
        </button>
      </section>

      {loading ? (
        <div className="loading">Memuatkan pelaporan...</div>
      ) : (
        <section className="panel">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr>
                  <HeaderCell>Modul</HeaderCell>
                  <HeaderCell>Jumlah</HeaderCell>
                  <HeaderCell>Draft</HeaderCell>
                  <HeaderCell>Dihantar</HeaderCell>
                  <HeaderCell>Disemak</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {MODULE_DEFINITIONS.map((module) => (
                  <tr key={module.key}>
                    <BodyCell>{module.label}</BodyCell>
                    <BodyCell>{modules[module.key].total}</BodyCell>
                    <BodyCell>{modules[module.key].draft}</BodyCell>
                    <BodyCell>{modules[module.key].submitted}</BodyCell>
                    <BodyCell>{modules[module.key].reviewed}</BodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {message && <div className="dashboard-inline-alert">{message}</div>}
    </div>
  );
}

function HeaderCell({ children }) {
  return <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e2e8f0" }}>{children}</th>;
}

function BodyCell({ children }) {
  return <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{children}</td>;
}
