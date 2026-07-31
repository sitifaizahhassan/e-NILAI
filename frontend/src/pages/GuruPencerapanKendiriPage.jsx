import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PencerapanForm from "../components/PencerapanForm";

export default function GuruPencerapanKendiriPage() {
  const [guruId, setGuruId] = useState(null);
  const [guruProfile, setGuruProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [formData, setFormData] = useState(null);

  // Fail RPH & BBM
  const [rphUrl, setRphUrl] = useState("");
  const [rphPath, setRphPath] = useState("");
  const [bbmUrl, setBbmUrl] = useState("");
  const [bbmPath, setBbmPath] = useState("");
  const [uploadingRph, setUploadingRph] = useState(false);
  const [uploadingBbm, setUploadingBbm] = useState(false);

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
        .from("pencerapan_kendiri")
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
        setRphUrl(existing.rph_url || "");
        setRphPath(existing.rph_path || "");
        setBbmUrl(existing.bbm_url || "");
        setBbmPath(existing.bbm_path || "");
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
          .from("pencerapan_kendiri")
          .update(record)
          .eq("id", formData.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("pencerapan_kendiri")
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
          .from("pencerapan_kendiri")
          .update(record)
          .eq("id", formData.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("pencerapan_kendiri")
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

  async function uploadFail(jenis, file) {
    if (!file || !guruId) return;
    const setUploading = jenis === "rph" ? setUploadingRph : setUploadingBbm;
    setUploading(true);
    setMsg("");
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${guruId}/kendiri/${jenis}-${timestamp}-${safeName}`;

      // Padam fail lama jika ada
      const oldPath = jenis === "rph" ? rphPath : bbmPath;
      if (oldPath) {
        await supabase.storage.from("pencerapan-fail").remove([oldPath]);
      }

      const { error: uploadErr } = await supabase.storage
        .from("pencerapan-fail")
        .upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("pencerapan-fail")
        .getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl || "";

      if (jenis === "rph") { setRphUrl(publicUrl); setRphPath(filePath); }
      else { setBbmUrl(publicUrl); setBbmPath(filePath); }

      // Simpan ke DB jika rekod sudah ada
      if (formData?.id) {
        const updateField = jenis === "rph"
          ? { rph_url: publicUrl, rph_path: filePath }
          : { bbm_url: publicUrl, bbm_path: filePath };
        const { error: dbErr } = await supabase
          .from("pencerapan_kendiri")
          .update(updateField)
          .eq("id", formData.id);
        if (dbErr) throw dbErr;
      }
      setMsg(`${jenis.toUpperCase()} berjaya dimuat naik ✅`);
    } catch (e) {
      setMsg(`Ralat muat naik ${jenis.toUpperCase()}: ` + e.message);
    } finally {
      setUploading(false);
    }
  }

  async function removeFail(jenis) {
    const path = jenis === "rph" ? rphPath : bbmPath;
    if (!path && !(jenis === "rph" ? rphUrl : bbmUrl)) return;
    setMsg("");
    try {
      if (path) {
        await supabase.storage.from("pencerapan-fail").remove([path]);
      }
      if (jenis === "rph") { setRphUrl(""); setRphPath(""); }
      else { setBbmUrl(""); setBbmPath(""); }

      if (formData?.id) {
        const updateField = jenis === "rph"
          ? { rph_url: null, rph_path: null }
          : { bbm_url: null, bbm_path: null };
        const { error: dbErr } = await supabase
          .from("pencerapan_kendiri")
          .update(updateField)
          .eq("id", formData.id);
        if (dbErr) throw dbErr;
      }
      setMsg(`${jenis.toUpperCase()} berjaya dibuang ✅`);
    } catch (e) {
      setMsg(`Ralat buang ${jenis.toUpperCase()}: ` + e.message);
    }
  }

  if (loading) return <div style={s.loading}>Memuatkan...</div>;

  const isSubmitted = formData?.status === "submitted";

  return (
    <div style={s.page}>
      <PencerapanForm
        formType="kendiri"
        initialData={formData}
        guruProfile={guruProfile}
        onSave={handleSave}
        onSubmit={handleSubmit}
        loading={loading}
        saving={saving}
        msg={msg}
        submittedAt={formData?.submittedAt}
        status={formData?.status || "draft"}
        canEditScores={!isSubmitted}
        canUploadFiles={!isSubmitted}
        canEditUlasan={false}
        showUlasan={false}
        rphUrl={rphUrl}
        rphPath={rphPath}
        bbmUrl={bbmUrl}
        bbmPath={bbmPath}
        uploadingRph={uploadingRph}
        uploadingBbm={uploadingBbm}
        onUploadRph={(file) => uploadFail("rph", file)}
        onUploadBbm={(file) => uploadFail("bbm", file)}
        onRemoveRph={() => removeFail("rph")}
        onRemoveBbm={() => removeFail("bbm")}
      />
    </div>
  );
}

const s = {
  page: { padding: "0 4px" },
  loading: { padding: 40, textAlign: "center", color: "#64748b" },
};
