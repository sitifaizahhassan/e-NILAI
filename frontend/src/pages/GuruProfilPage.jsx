import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function GuruProfilPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const p = data || { id: user.id, email: user.email };
      setProfile(p);
      setForm({
        nama: p.nama || "",
        no_kp: p.no_kp || "",
        jawatan: p.jawatan || "",
        opsyen: p.opsyen || "",
        gred: p.gred || "",
        telefon: p.telefon || "",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!profile?.id) return;
    setSaving(true);
    setMsg("");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nama: form.nama,
          no_kp: form.no_kp,
          jawatan: form.jawatan,
          opsyen: form.opsyen,
          gred: form.gred,
          telefon: form.telefon,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;
      setMsg("Profil berjaya dikemaskini.");
      setEditing(false);
      await loadProfile();
    } catch (e) {
      setMsg("Ralat: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={s.loading}>Memuatkan profil...</div>;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Profil Guru</h2>
          <p style={s.sub}>Maklumat peribadi dan akaun</p>
        </div>
        {!editing && (
          <button style={s.editBtn} onClick={() => { setEditing(true); setMsg(""); }}>
            ✏️ Edit Profil
          </button>
        )}
      </div>

      {msg && (
        <div style={{
          ...s.msgBox,
          background: msg.includes("Ralat") ? "#fef2f2" : "#f0fdf4",
          borderColor: msg.includes("Ralat") ? "#fca5a5" : "#86efac",
          color: msg.includes("Ralat") ? "#dc2626" : "#16a34a",
        }}>
          {msg}
        </div>
      )}

      {/* Avatar */}
      <div style={s.avatarRow}>
        <div style={s.avatar}>
          {(profile?.nama || profile?.email || "G").charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={s.avatarName}>{profile?.nama || profile?.email || "-"}</div>
          <div style={s.avatarRole}>{profile?.role || "guru"}</div>
        </div>
      </div>

      {/* Profile Fields */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>Maklumat Peribadi</h3>
        <div style={s.grid2}>
          <ProfileField
            label="Nama Penuh"
            value={form.nama}
            editing={editing}
            onChange={(v) => setForm((p) => ({ ...p, nama: v }))}
          />
          <ProfileField
            label="No. Kad Pengenalan"
            value={form.no_kp}
            editing={editing}
            onChange={(v) => setForm((p) => ({ ...p, no_kp: v }))}
            placeholder="Cth: 990101-01-1234"
          />
          <ProfileField
            label="Jawatan"
            value={form.jawatan}
            editing={editing}
            onChange={(v) => setForm((p) => ({ ...p, jawatan: v }))}
            placeholder="Cth: Guru Cemerlang"
          />
          <ProfileField
            label="Opsyen / Mata Pelajaran"
            value={form.opsyen}
            editing={editing}
            onChange={(v) => setForm((p) => ({ ...p, opsyen: v }))}
            placeholder="Cth: Matematik"
          />
          <ProfileField
            label="Gred"
            value={form.gred}
            editing={editing}
            onChange={(v) => setForm((p) => ({ ...p, gred: v }))}
            placeholder="Cth: DG48"
          />
          <ProfileField
            label="No. Telefon"
            value={form.telefon}
            editing={editing}
            onChange={(v) => setForm((p) => ({ ...p, telefon: v }))}
            placeholder="Cth: 012-3456789"
          />
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>Maklumat Akaun</h3>
        <div style={s.grid2}>
          <div style={s.readField}>
            <div style={s.fieldLabel}>E-mel</div>
            <div style={s.fieldValue}>{profile?.email || "-"}</div>
          </div>
          <div style={s.readField}>
            <div style={s.fieldLabel}>Peranan</div>
            <div style={s.fieldValue}>
              <span style={s.roleBadge}>{profile?.role || "guru"}</span>
            </div>
          </div>
          <div style={s.readField}>
            <div style={s.fieldLabel}>Tarikh Daftar</div>
            <div style={s.fieldValue}>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("ms-MY")
                : "-"}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div style={s.actionBar}>
          <button
            style={s.cancelBtn}
            onClick={() => { setEditing(false); setMsg(""); }}
            disabled={saving}
          >
            Batal
          </button>
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "💾 Simpan"}
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileField({ label, value, editing, onChange, placeholder }) {
  return (
    <div style={s.field}>
      <label style={s.fieldLabel}>{label}</label>
      {editing ? (
        <input
          style={s.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div style={s.fieldValue}>{value || <span style={{ color: "#9ca3af" }}>-</span>}</div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    maxWidth: 760,
    margin: "0 auto",
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#1e3a5f",
  },
  sub: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "#64748b",
  },
  editBtn: {
    border: "1px solid #3b82f6",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: 8,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  loading: { padding: 40, textAlign: "center", color: "#64748b" },
  msgBox: {
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 16,
    fontSize: 14,
  },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    padding: "16px 20px",
    background: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#1e3a5f",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 700,
    flexShrink: 0,
  },
  avatarName: {
    fontWeight: 700,
    fontSize: 16,
    color: "#1e293b",
  },
  avatarRole: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    textTransform: "capitalize",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    margin: "0 0 16px",
    fontSize: 15,
    fontWeight: 700,
    color: "#1e293b",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 8,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 14,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  readField: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: 500,
    padding: "4px 0",
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
  },
  roleBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "3px 10px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  actionBar: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  cancelBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    borderRadius: 8,
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  saveBtn: {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
};