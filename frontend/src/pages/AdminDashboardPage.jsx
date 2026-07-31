import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboardPage.css";
import { fetchAdminCollections, buildModuleSummary } from "../lib/admin";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [collections, setCollections] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setMessage("");
    try {
      setCollections(await fetchAdminCollections());
    } catch (error) {
      console.error(error);
      setMessage(`Ralat memuatkan dashboard admin: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    if (!collections) {
      return {
        guru: 0,
        admin: 0,
        keberhasilan: { total: 0, draft: 0, submitted: 0, reviewed: 0 },
        pencerapan: 0,
      };
    }

    return {
      guru: collections.profiles.filter((profile) => profile.role !== "admin").length,
      admin: collections.profiles.filter((profile) => profile.role === "admin").length,
      keberhasilan: buildModuleSummary(collections.keberhasilanForms),
      pencerapan:
        collections.pencerapanKendiri.length +
        collections.pencerapan1.length +
        collections.pencerapan2.length,
    };
  }, [collections]);

  return (
    <div className="admin-wrap" style={{ padding: 0, minHeight: "auto" }}>
      <div className="admin-header">
        <div>
          <h1>Ringkasan Pentadbir</h1>
          <p>Pantau capaian guru dan urus tindakan admin dari papan pemuka utama.</p>
        </div>
        <button className="refresh-btn" type="button" onClick={loadData}>
          Muat Semula
        </button>
      </div>

      {loading ? (
        <div className="loading">Memuatkan dashboard admin...</div>
      ) : (
        <>
          <section className="cards-grid">
            <div className="stat-card" style={{ "--accent": "#2563eb" }}>
              <p>Jumlah Guru</p>
              <h3>{summary.guru}</h3>
            </div>
            <div className="stat-card" style={{ "--accent": "#10b981" }}>
              <p>Jumlah Admin</p>
              <h3>{summary.admin}</h3>
            </div>
            <div className="stat-card" style={{ "--accent": "#f59e0b" }}>
              <p>Borang Keberhasilan</p>
              <h3>{summary.keberhasilan.total}</h3>
            </div>
            <div className="stat-card" style={{ "--accent": "#8b5cf6" }}>
              <p>Jumlah Pencerapan</p>
              <h3>{summary.pencerapan}</h3>
            </div>
          </section>

          <section className="panel" style={{ marginBottom: 16 }}>
            <h2>Status Keberhasilan</h2>
            <p className="sub">Paparan ringkas kemajuan borang keberhasilan semua pengguna.</p>
            <div className="bar-chart">
              {[
                { label: "Draft", value: summary.keberhasilan.draft, color: "#64748b" },
                { label: "Dihantar", value: summary.keberhasilan.submitted, color: "#2563eb" },
                { label: "Disemak", value: summary.keberhasilan.reviewed, color: "#059669" },
              ].map((item) => (
                <div className="bar-row" key={item.label}>
                  <div className="bar-label">{item.label}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${summary.keberhasilan.total ? (item.value / summary.keberhasilan.total) * 100 : 0}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                  <div className="bar-value">{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Tindakan Pantas</h2>
            <p className="sub">Akses terus ke halaman penting untuk pemantauan dan pentadbiran.</p>
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              <QuickLink to="/admin/status" label="Lihat Status Semua Borang" />
              <QuickLink to="/admin/kontrol-admin" label="Urus Peranan Admin" />
              <QuickLink to="/admin/pelaporan" label="Buka Pelaporan" />
              <QuickLink to="/admin/semakan-keberhasilan" label="Semakan Terperinci Keberhasilan" />
            </div>
          </section>
        </>
      )}

      {message && <div className="dashboard-inline-alert">{message}</div>}
    </div>
  );
}

function QuickLink({ to, label }) {
  return (
    <Link className="refresh-btn" style={{ textDecoration: "none", display: "inline-flex", width: "fit-content" }} to={to}>
      {label}
    </Link>
  );
}
