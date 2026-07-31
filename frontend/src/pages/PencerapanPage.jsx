import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  createEmptyPencerapanForm,
  getUserDisplayName,
  getWorkflowLabel,
  getWorkflowTone,
  PENCERAPAN_CONFIG,
  PENCERAPAN_FIELDS,
} from "../lib/navigation";

export default function PencerapanPage({ variant }) {
  const { user, profile } = useOutletContext();
  const config = PENCERAPAN_CONFIG[variant];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [recordId, setRecordId] = useState(null);
  const [status, setStatus] = useState("draft");
  const [formData, setFormData] = useState(createEmptyPencerapanForm());
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    if (user?.id && config) {
      loadRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, config?.tableName]);

  async function loadRecord() {
    setLoading(true);
    setMessage("");
    try {
      const { data: existing, error } = await supabase
        .from(config.tableName)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      let current = existing;
      if (!current) {
        const { data: created, error: createError } = await supabase
          .from(config.tableName)
          .insert({ user_id: user.id, form_data: createEmptyPencerapanForm(), status: "draft" })
          .select()
          .single();

        if (createError) throw createError;
        current = created;
      }

      setRecordId(current.id);
      setStatus(current.status || "draft");
      setFormData({ ...createEmptyPencerapanForm(), ...(current.form_data || {}) });
      setUpdatedAt(current.updated_at || current.created_at || null);
    } catch (loadError) {
      console.error(loadError);
      setMessage(`Ralat memuatkan ${config.title.toLowerCase()}: ${loadError.message}`);
    } finally {
      setLoading(false);
    }
  }

  function updateField(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function persist(nextStatus = status) {
    if (!recordId) return;

    setSaving(true);
    setMessage("");
    try {
      const payload = {
        form_data: formData,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from(config.tableName).update(payload).eq("id", recordId);
      if (error) throw error;

      setStatus(nextStatus);
      setUpdatedAt(payload.updated_at);
      setMessage(nextStatus === "submitted" ? "Borang berjaya dihantar." : "Draf berjaya disimpan.");
    } catch (saveError) {
      console.error(saveError);
      setMessage(`Ralat menyimpan borang: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  }

  const completedCount = useMemo(
    () => PENCERAPAN_FIELDS.filter((field) => String(formData[field.key] || "").trim()).length,
    [formData]
  );

  if (!config) return null;
  if (loading) return <div className="loading">Memuatkan {config.title.toLowerCase()}...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel">
        <h2>{config.title}</h2>
        <p className="sub">{config.description}</p>

        <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
          <div><strong>Nama:</strong> {getUserDisplayName(profile, user)}</div>
          <div><strong>No KP:</strong> {profile?.no_kp || "-"}</div>
          <div><strong>Jawatan:</strong> {profile?.jawatan || "-"}</div>
          <div>
            <strong>Status:</strong>{" "}
            <span
              style={{
                background: getWorkflowTone(status),
                color: "#fff",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {getWorkflowLabel(status)}
            </span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="sub" style={{ marginBottom: 16 }}>
          Lengkap diisi: {completedCount}/{PENCERAPAN_FIELDS.length} medan
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {PENCERAPAN_FIELDS.map((field) => (
            <label key={field.key} style={{ display: "grid", gap: 6 }}>
              <strong>{field.label}</strong>
              <textarea
                value={formData[field.key] || ""}
                onChange={(event) => updateField(field.key, event.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  padding: 12,
                  resize: "vertical",
                  font: "inherit",
                }}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="refresh-btn" type="button" onClick={() => persist("draft")} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Draf"}
          </button>
          <button className="refresh-btn" type="button" onClick={() => persist("submitted")} disabled={saving}>
            Hantar Borang
          </button>
        </div>
        <p className="sub" style={{ marginTop: 12 }}>
          Kemaskini terakhir: {updatedAt ? new Date(updatedAt).toLocaleString("ms-MY") : "-"}
        </p>
        {message && <div className="dashboard-inline-alert">{message}</div>}
      </section>
    </div>
  );
}
