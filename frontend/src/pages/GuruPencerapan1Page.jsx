import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUserRole } from "../lib/useUserRole";
import PencerapanForm from "../components/PencerapanForm";

export default function GuruPencerapan1Page() {
  const { role, userId, loading: roleLoading, isPentadbirOrAdmin } = useUserRole();

  const [guruList, setGuruList] = useState([]);
  const [selectedGuruId, setSelectedGuruId] = useState("");
  const [guruProfile, setGuruProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [formData, setFormData] = useState(null);

  // Ulasan pentadbir
  const [ulasan, setUlasan] = useState("");

  // Fail RPH & BBM
  const [rphUrl, setRphUrl] = useState("");
  const [rphPath, setRphPath] = useState("");
  const [bbmUrl, setBbmUrl] = useState("");
  const [bbmPath, setBbmPath] = useState("");
  const [uploadingRph, setUploadingRph] = useState(false);
  const [uploadingBbm, setUploadingBbm] = useState(false);

  // Muatkan senarai guru apabila pentadbir/admin
  useEffect(() => {
    if (!roleLoading && isPentadbirOrAdmin) {
      loadGuruList();
    }
  }, [roleLoading, isPentadbirOrAdmin]);

  // Muatkan data guru semasa apabila bukan pentadbir/admin
  useEffect(() => {
    if (!roleLoading && !isPentadbirOrAdmin && userId) {
      loadFormData(userId);
    }
  }, [roleLoading, isPentadbirOrAdmin, userId]);

  // Muatkan data apabila guru dipilih oleh pentadbir/admin
  useEffect(() => {
    if (selectedGuruId) {
      loadFormData(selectedGuruId);
    } else if (isPentadbirOrAdmin) {
      setFormData(null);
      setGuruProfile(null);
      setUlasan("");
      setRphUrl(""); setRphPath(""); setBbmUrl(""); setBbmPath("");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuruId]);

  async function loadGuruList() {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, nama, email, jawatan")
        .order("nama", { ascending: true });
      setGuruList(data || []);
    } catch {
      // ignore
    }
  }

  async function loadFormData(targetGuruId) {
    setLoading(true);
    setMsg("");
    try {
      // Profil guru
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetGuruId)
        .maybeSingle();
      setGuruProfile(profile || { id: targetGuruId });

      const { data: existing } = await supabase
        .from("pencerapan_1")
        .select("*")
        .eq("guru_id", targetGuruId)
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
        setUlasan(existing.ulasan || "");
        setRphUrl(existing.rph_url || "");
        setRphPath(existing.rph_path || "");
        setBbmUrl(existing.bbm_url || "");
        setBbmPath(existing.bbm_path || "");
      } else {
        setFormData(null);
        setUlasan("");
        setRphUrl(""); setRphPath(""); setBbmUrl(""); setBbmPath("");
      }
    } catch (e) {
      setMsg("Ralat: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const targetGuruId = isPentadbirOrAdmin ? selectedGuruId : userId;

  async function handleSave(payload) {
    if (!targetGuruId) return;
    setSaving(true);
    setMsg("");
    try {
      const record = {
        guru_id: targetGuruId,
        maklumat: payload.maklumat,
        scores: payload.scores,
        catatan: payload.catatan,
        ulasan: ulasan,
        status: "draft",
        updated_at: new Date().toISOString(),
      };

      let result;
      if (formData?.id) {
        const { data, error } = await supabase
          .from("pencerapan_1")
          .update(record)
          .eq("id", formData.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("pencerapan_1")
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
      setUlasan(result.ulasan || "");
      setMsg("Draft berjaya disimpan.");
    } catch (e) {
      setMsg("Ralat simpan: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    if (!targetGuruId) return;
    setSaving(true);
    setMsg("");
    try {
      const now = new Date().toISOString();
      const record = {
        guru_id: targetGuruId,
        maklumat: payload.maklumat,
        scores: payload.scores,
        catatan: payload.catatan,
        ulasan: ulasan,
        status: "submitted",
        submitted_at: now,
        updated_at: now,
      };

      let result;
      if (formData?.id) {
        const { data, error } = await supabase
          .from("pencerapan_1")
          .update(record)
          .eq("id", formData.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("pencerapan_1")
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
      setUlasan(result.ulasan || "");
      setMsg("Borang berjaya dihantar!");
    } catch (e) {
      setMsg("Ralat hantar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadFail(jenis, file) {
    if (!file || !targetGuruId) return;
    const setUploading = jenis === "rph" ? setUploadingRph : setUploadingBbm;
    setUploading(true);
    setMsg("");
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${targetGuruId}/pencerapan_1/${jenis}-${timestamp}-${safeName}`;

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

      if (formData?.id) {
        const updateField = jenis === "rph"
          ? { rph_url: publicUrl, rph_path: filePath }
          : { bbm_url: publicUrl, bbm_path: filePath };
        const { error: dbErr } = await supabase
          .from("pencerapan_1")
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
          .from("pencerapan_1")
          .update(updateField)
          .eq("id", formData.id);
        if (dbErr) throw dbErr;
      }
      setMsg(`${jenis.toUpperCase()} berjaya dibuang ✅`);
    } catch (e) {
      setMsg(`Ralat buang ${jenis.toUpperCase()}: ` + e.message);
    }
  }

  if (roleLoading) return <div style={s.loading}>Memuatkan...</div>;

  return (
    <div style={s.page}>
      {/* Pemilih Guru (hanya untuk pentadbir/admin) */}
      {isPentadbirOrAdmin && (
        <div style={s.guruSelector}>
          <label style={s.selectorLabel}>🎓 Pilih Guru untuk Dinilai:</label>
          <select
            style={s.selectorInput}
            value={selectedGuruId}
            onChange={(e) => setSelectedGuruId(e.target.value)}
          >
            <option value="">— Pilih guru —</option>
            {guruList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama || g.email} {g.jawatan ? `(${g.jawatan})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tunjuk borang setelah guru dipilih (pentadbir/admin) atau terus untuk guru */}
      {(!isPentadbirOrAdmin || selectedGuruId) ? (
        loading ? (
          <div style={s.loading}>Memuatkan...</div>
        ) : (
          <PencerapanForm
            formType="1"
            initialData={formData}
            guruProfile={guruProfile}
            onSave={handleSave}
            onSubmit={handleSubmit}
            loading={loading}
            saving={saving}
            msg={msg}
            submittedAt={formData?.submittedAt}
            status={formData?.status || "draft"}
            canEditScores={isPentadbirOrAdmin}
            canUploadFiles={isPentadbirOrAdmin}
            canEditUlasan={isPentadbirOrAdmin}
            showUlasan={true}
            ulasan={ulasan}
            onUlasanChange={setUlasan}
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
        )
      ) : (
        <div style={s.placeholder}>
          <p style={s.placeholderText}>Sila pilih guru dari senarai di atas untuk melihat atau mengisi Pencerapan 1.</p>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: "0 4px" },
  loading: { padding: 40, textAlign: "center", color: "#64748b" },
  guruSelector: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  selectorLabel: {
    fontWeight: 600,
    fontSize: 14,
    color: "#374151",
    whiteSpace: "nowrap",
  },
  selectorInput: {
    flex: 1,
    minWidth: 200,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
  },
  placeholder: {
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: 12,
    padding: "40px 20px",
    textAlign: "center",
  },
  placeholderText: {
    color: "#64748b",
    fontSize: 15,
    margin: 0,
  },
};
