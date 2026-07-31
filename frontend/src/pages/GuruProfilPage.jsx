import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function GuruProfilPage() {
  const { user, profile, refreshSession } = useOutletContext();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    nama: "",
    no_kp: "",
    jawatan: "",
    gred: "",
    opsyen: "",
  });

  useEffect(() => {
    setForm({
      nama: user?.user_metadata?.full_name || profile?.full_name || "",
      no_kp: profile?.no_kp || "",
      jawatan: profile?.jawatan || "",
      gred: profile?.gred || "",
      opsyen: profile?.opsyen || "",
    });
  }, [profile, user]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: form.nama },
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          no_kp: form.no_kp,
          jawatan: form.jawatan,
          gred: form.gred,
          opsyen: form.opsyen,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      await refreshSession();
      setMessage("Profil berjaya dikemaskini.");
    } catch (error) {
      console.error(error);
      setMessage(`Ralat menyimpan profil: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <h2>Profil Guru</h2>
      <p className="sub">Kemaskini maklumat asas untuk digunakan pada semua borang penilaian anda.</p>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 16, marginTop: 16 }}>
        <Field label="Nama" value={form.nama} onChange={(value) => updateField("nama", value)} />
        <Field label="No KP" value={form.no_kp} onChange={(value) => updateField("no_kp", value)} />
        <Field label="Jawatan" value={form.jawatan} onChange={(value) => updateField("jawatan", value)} />
        <Field label="Gred" value={form.gred} onChange={(value) => updateField("gred", value)} />
        <Field label="Opsyen" value={form.opsyen} onChange={(value) => updateField("opsyen", value)} />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="refresh-btn" type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </form>

      {message && <div className="dashboard-inline-alert">{message}</div>}
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <strong>{label}</strong>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 10,
          padding: "10px 12px",
        }}
      />
    </label>
  );
}
