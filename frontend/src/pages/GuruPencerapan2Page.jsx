import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PencerapanForm from "../components/PencerapanForm";

export default function GuruPencerapan2Page() {
  const [guruId, setGuruId] = useState(null);
  const [guruProfile, setGuruProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    setMsg("");
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error("Sila log masuk semula.");
      setGuruId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setGuruProfile(profile || { email: user.email });

      const { data: existing } = await supabase
        .from("pencerapan_2")
        .select("*")
        .eq("guru_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        setFormData({
          id: existing.id,
          maklumat: existing.maklumat || {},
          scores: existing.scores || {},
          catatan: existing.catatan || "",
          status: existing.status || "draft",
          submittedAt: existing.submitted_at,
        });
      }
    } catch (e) {
      setMsg("Ralat: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(payload) {
    if (!guruId) return;
    setSaving(true);
    setMsg("");
    try {
      const record = {
        guru_id: guruId,
        maklumat: payload.maklumat,
        scores: payload.scores,
        catatan: payload.catatan,
        status: "draft",
        updated_at: new Date().toISOString(),
      };

      let result;
      if (formData?.id) {
        const { data, error } = await supabase
          .from("pencerapan_2")
          .update(record)
          .eq("id", formData.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("pencerapan_2")
          .insert({ ...record, created_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      setFormData({
        id: result.id,
        maklumat: result.maklumat,
        scores: result.scores,
        catatan: result.catatan,
        status: result.status,
        submittedAt: result.submitted_at,
      });
      setMsg("Draft berjaya disimpan.");
    } catch (e) {
      setMsg("Ralat simpan: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    if (!guruId) return;
    setSaving(true);
    setMsg("");
    try {
      const now = new Date().toISOString();
      const record = {
        guru_id: guruId,
        maklumat: payload.maklumat,
        scores: payload.scores,
        catatan: payload.catatan,
        status: "submitted",
        submitted_at: now,
        updated_at: now,
      };

      let result;
      if (formData?.id) {
        const { data, error } = await supabase
          .from("pencerapan_2")
          .update(record)
          .eq("id", formData.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("pencerapan_2")
          .insert({ ...record, created_at: now })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      setFormData({
        id: result.id,
        maklumat: result.maklumat,
        scores: result.scores,
        catatan: result.catatan,
        status: result.status,
        submittedAt: result.submitted_at,
      });
      setMsg("Borang berjaya dihantar!");
    } catch (e) {
      setMsg("Ralat hantar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={s.loading}>Memuatkan...</div>;

  return (
    <div style={s.page}>
      <PencerapanForm
        formType="2"
        initialData={formData}
        guruProfile={guruProfile}
        onSave={handleSave}
        onSubmit={handleSubmit}
        loading={loading}
        saving={saving}
        msg={msg}
        submittedAt={formData?.submittedAt}
        status={formData?.status || "draft"}
      />
    </div>
  );
}

const s = {
  page: { padding: "0 4px" },
  loading: { padding: 40, textAlign: "center", color: "#64748b" },
};
