import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getProfileLabel } from "../lib/admin";

export default function AdminControlPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("role", { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error(error);
      setMessage(`Ralat memuatkan profil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function updateRole(id, value) {
    setProfiles((prev) => prev.map((profile) => (profile.id === id ? { ...profile, role: value } : profile)));
  }

  async function saveRole(profile) {
    try {
      setMessage("");
      const { error } = await supabase
        .from("profiles")
        .update({ role: profile.role })
        .eq("id", profile.id);
      if (error) throw error;
      setMessage(`Peranan untuk ${getProfileLabel(profile)} berjaya dikemaskini.`);
      await loadProfiles();
    } catch (error) {
      console.error(error);
      setMessage(`Ralat kemaskini peranan: ${error.message}`);
    }
  }

  return (
    <section className="panel">
      <h2>Kontrol Admin</h2>
      <p className="sub">Urus siapa yang mempunyai akses sebagai admin dengan menukar peranan pengguna.</p>

      {loading ? (
        <div className="loading">Memuatkan senarai pengguna...</div>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr>
                <th style={headerCell}>Pengguna</th>
                <th style={headerCell}>No KP</th>
                <th style={headerCell}>Jawatan</th>
                <th style={headerCell}>Peranan</th>
                <th style={headerCell}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td style={bodyCell}>{getProfileLabel(profile)}</td>
                  <td style={bodyCell}>{profile.no_kp || "-"}</td>
                  <td style={bodyCell}>{profile.jawatan || "-"}</td>
                  <td style={bodyCell}>
                    <select
                      value={profile.role || "teacher"}
                      onChange={(event) => updateRole(profile.id, event.target.value)}
                      style={{ borderRadius: 8, padding: "8px 10px" }}
                    >
                      <option value="teacher">Guru</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={bodyCell}>
                    <button type="button" className="refresh-btn" onClick={() => saveRole(profile)}>
                      Simpan
                    </button>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td style={bodyCell} colSpan={5}>Tiada pengguna untuk dikawal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {message && <div className="dashboard-inline-alert">{message}</div>}
    </section>
  );
}

const headerCell = {
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const bodyCell = {
  padding: 12,
  borderBottom: "1px solid #e2e8f0",
};
