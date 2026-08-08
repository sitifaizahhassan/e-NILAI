import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const STATUS = {
  DRAFT: "draft",
  DIHANTAR_1: "dihantar_1",
  DINILAI_1: "dinilai_1",
  DIHANTAR_2: "dihantar_2",
  DINILAI_2: "dinilai_2",
};

const STATUS_SASARAN_OPTIONS = [
  "Belum Capai",
  "Capai Sebahagian",
  "Capai",
  "Melebihi Sasaran",
];

const EMPTY_ITEM = (bil = 1) => ({
  bil,
  aspek: "",
  sasaran_keberhasilan: "",
  pencapaian_pertama: "",
  penilaian_pertama: "",
  status_sasaran: "",
  pencapaian_akhir: "",
  penilaian_akhir: "",
  catatan: "",
  evidens_url: "",
  evidens_path: "",
});

export default function GuruKeberhasilanPage() {
  const [guruId, setGuruId] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [formId, setFormId] = useState(null);
  const [tahun] = useState(new Date().getFullYear());
  const [status, setStatus] = useState(STATUS.DRAFT);

  const [maklumat, setMaklumat] = useState({
    nama_pyd: "",
    no_kp: "",
    jawatan: "",
    gred: "",
    tempat_bertugas: "",
  });

  const [items, setItems] = useState([EMPTY_ITEM(1), EMPTY_ITEM(2)]);

  const [tarikhPenetapan, setTarikhPenetapan] = useState(null);
  const [tarikhPenilaian1, setTarikhPenilaian1] = useState(null);
  const [tarikhPenilaian2, setTarikhPenilaian2] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id || null;
      if (!uid) {
        setMsg("Ralat: sila log masuk semula.");
        setLoading(false);
        return;
      }
      setGuruId(uid);
      initData(uid);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function initData(uid) {
    setLoading(true);
    setMsg("");
    try {
      const { data: existing, error: findErr } = await supabase
        .from("keberhasilan_forms")
        .select("*")
        .eq("guru_id", uid)
        .eq("tahun", tahun)
        .maybeSingle();

      if (findErr) throw findErr;

      let currentForm = existing;

      if (!currentForm) {
        const today = new Date().toISOString().slice(0, 10);
        const { data: created, error: createErr } = await supabase
          .from("keberhasilan_forms")
          .insert({
            guru_id: uid,
            tahun,
            status: STATUS.DRAFT,
            tarikh_penetapan: today,
          })
          .select()
          .single();

        if (createErr) throw createErr;
        currentForm = created;

        const { error: itemSeedErr } = await supabase.from("keberhasilan_items").insert([
          { form_id: currentForm.id, bil: 1 },
          { form_id: currentForm.id, bil: 2 },
        ]);
        if (itemSeedErr) throw itemSeedErr;
      }

      setFormId(currentForm.id);
      setStatus(currentForm.status || STATUS.DRAFT);
      setTarikhPenetapan(currentForm.tarikh_penetapan || null);
      setTarikhPenilaian1(currentForm.tarikh_penilaian_1 || null);
      setTarikhPenilaian2(currentForm.tarikh_penilaian_2 || null);

      setMaklumat({
        nama_pyd: currentForm.nama_pyd || "",
        no_kp: currentForm.no_kp || "",
        jawatan: currentForm.jawatan || "",
        gred: currentForm.gred || "",
        tempat_bertugas: currentForm.tempat_bertugas || "",
      });

      const { data: itemRows, error: itemErr } = await supabase
        .from("keberhasilan_items")
        .select("*")
        .eq("form_id", currentForm.id)
        .order("bil", { ascending: true, nullsFirst: false })
        .order("id", { ascending: true });

      if (itemErr) throw itemErr;

      if (!itemRows || itemRows.length === 0) {
        setItems([EMPTY_ITEM(1), EMPTY_ITEM(2)]);
      } else {
        setItems(
          itemRows.map((r, i) => ({
            id: r.id,
            bil: r.bil ?? i + 1,
            aspek: r.aspek || "",
            sasaran_keberhasilan: r.sasaran_keberhasilan || "",
            pencapaian_pertama: r.pencapaian_pertama || "",
            penilaian_pertama: r.penilaian_pertama ?? "",
            status_sasaran: r.status_sasaran || "",
            pencapaian_akhir: r.pencapaian_akhir || "",
            penilaian_akhir: r.penilaian_akhir ?? "",
            catatan: r.catatan || "",
            evidens_url: r.evidens_url || "",
            evidens_path: r.evidens_path || "",
          }))
        );
      }
    } catch (e) {
      console.error(e);
      setMsg("Ralat init data: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function updateMaklumat(key, value) {
    setMaklumat((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(index, key, value) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, EMPTY_ITEM(prev.length + 1)]);
  }

  function removeItem(index) {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next.map((it, i) => ({ ...it, bil: i + 1 }));
    });
  }

  function toNumberOrNull(v) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }

  async function upsertItems(currentFormId) {
    const { data: existingRows, error: fetchErr } = await supabase
      .from("keberhasilan_items")
      .select("id")
      .eq("form_id", currentFormId);

    if (fetchErr) throw fetchErr;

    const existingIds = (existingRows || []).map((r) => r.id);
    const currentIds = items.filter((i) => i.id).map((i) => i.id);
    const deletedIds = existingIds.filter((id) => !currentIds.includes(id));

    if (deletedIds.length > 0) {
      const { error: delErr } = await supabase
        .from("keberhasilan_items")
        .delete()
        .in("id", deletedIds);
      if (delErr) throw delErr;
    }

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const payload = {
        form_id: currentFormId,
        bil: toNumberOrNull(row.bil) ?? i + 1,
        aspek: row.aspek,
        sasaran_keberhasilan: row.sasaran_keberhasilan,
        pencapaian_pertama: row.pencapaian_pertama,
        penilaian_pertama: toNumberOrNull(row.penilaian_pertama),
        status_sasaran: row.status_sasaran,
        pencapaian_akhir: row.pencapaian_akhir,
        penilaian_akhir: toNumberOrNull(row.penilaian_akhir),
        catatan: row.catatan,
        evidens_url: row.evidens_url || null,
        evidens_path: row.evidens_path || null,
      };

      if (row.id) {
        const { error } = await supabase
          .from("keberhasilan_items")
          .update(payload)
          .eq("id", row.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("keberhasilan_items")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        items[i].id = data.id;
      }
    }
  }

  async function simpanDraft() {
    if (!formId || saving) return;

    try {
      setSaving(true);
      setMsg("");

      const { error: formErr } = await supabase
        .from("keberhasilan_forms")
        .update({
          nama_pyd: maklumat.nama_pyd,
          no_kp: maklumat.no_kp,
          jawatan: maklumat.jawatan,
          gred: maklumat.gred,
          tempat_bertugas: maklumat.tempat_bertugas,
          status: STATUS.DRAFT,
        })
        .eq("id", formId);

      if (formErr) throw formErr;

      await upsertItems(formId);

      setStatus(STATUS.DRAFT);
      setMsg("Draft berjaya disimpan ✅");
      setItems((prev) => [...prev]);
    } catch (e) {
      console.error(e);
      setMsg("Ralat simpan draft: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function hantarPenilaian1() {
    if (!formId || saving) return;

    try {
      setSaving(true);
      setMsg("");

      await simpanDraftSilently();

      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from("keberhasilan_forms")
        .update({
          status: STATUS.DIHANTAR_1,
          tarikh_penetapan: tarikhPenetapan || today,
          tarikh_hantar_1: today,
        })
        .eq("id", formId);

      if (error) throw error;

      setStatus(STATUS.DIHANTAR_1);
      setTarikhPenetapan((prev) => prev || today);
      setMsg("Berjaya dihantar untuk Penilaian Pertama ✅");
    } catch (e) {
      console.error(e);
      setMsg("Ralat hantar penilaian pertama: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function hantarPenilaianAkhir() {
    if (!formId || saving) return;

    if (status === STATUS.DRAFT) {
      setMsg("Sila hantar Penilaian Pertama dahulu sebelum menghantar Penilaian Kedua.");
      return;
    }

    try {
      setSaving(true);
      setMsg("");

      await simpanDraftSilently();

      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from("keberhasilan_forms")
        .update({
          status: STATUS.DIHANTAR_2,
          tarikh_penilaian_1: tarikhPenilaian1 || today,
          tarikh_hantar_2: today,
        })
        .eq("id", formId);

      if (error) throw error;

      setStatus(STATUS.DIHANTAR_2);
      setTarikhPenilaian1((prev) => prev || today);
      setMsg("Berjaya dihantar untuk Penilaian Akhir ✅");
    } catch (e) {
      console.error(e);
      setMsg("Ralat hantar penilaian akhir: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function simpanDraftSilently() {
    const { error: formErr } = await supabase
      .from("keberhasilan_forms")
      .update({
        nama_pyd: maklumat.nama_pyd,
        no_kp: maklumat.no_kp,
        jawatan: maklumat.jawatan,
        gred: maklumat.gred,
        tempat_bertugas: maklumat.tempat_bertugas,
      })
      .eq("id", formId);

    if (formErr) throw formErr;
    await upsertItems(formId);
  }

  async function uploadEvidens(index, file) {
    if (!file || uploadingIndex !== null) return;
    setUploadingIndex(index);
    setMsg("");
    try {
      const item = items[index];
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${guruId}/${formId}-bil${item.bil ?? index + 1}-${timestamp}-${safeName}`;

      // Padam fail lama jika ada
      if (item.evidens_path) {
        await supabase.storage.from("evidens-keberhasilan").remove([item.evidens_path]);
      }

      const { error: uploadErr } = await supabase.storage
        .from("evidens-keberhasilan")
        .upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("evidens-keberhasilan")
        .getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl || "";

      // Kemas kini state
      const updatedItems = items.map((it, i) =>
        i === index ? { ...it, evidens_url: publicUrl, evidens_path: filePath } : it
      );
      setItems(updatedItems);

      // Simpan ke DB jika item sudah ada ID
      if (item.id) {
        const { error: dbErr } = await supabase
          .from("keberhasilan_items")
          .update({ evidens_url: publicUrl, evidens_path: filePath })
          .eq("id", item.id);
        if (dbErr) throw dbErr;
      }
      setMsg("Evidens berjaya dimuat naik ✅");
    } catch (e) {
      console.error(e);
      setMsg("Ralat muat naik evidens: " + e.message);
    } finally {
      setUploadingIndex(null);
    }
  }

  async function removeEvidens(index) {
    const item = items[index];
    if (!item.evidens_path && !item.evidens_url) return;
    setMsg("");
    try {
      if (item.evidens_path) {
        await supabase.storage.from("evidens-keberhasilan").remove([item.evidens_path]);
      }
      const updatedItems = items.map((it, i) =>
        i === index ? { ...it, evidens_url: "", evidens_path: "" } : it
      );
      setItems(updatedItems);
      if (item.id) {
        const { error: dbErr } = await supabase
          .from("keberhasilan_items")
          .update({ evidens_url: null, evidens_path: null })
          .eq("id", item.id);
        if (dbErr) throw dbErr;
      }
      setMsg("Evidens berjaya dibuang ✅");
    } catch (e) {
      console.error(e);
      setMsg("Ralat buang evidens: " + e.message);
    }
  }

  const allEvidensUploaded = items.length > 0 && items.every((it) => !!it.evidens_url);

  const penilaianPertamaBelumDihantar = status === STATUS.DRAFT;
  const butangKeduaDisabled = penilaianPertamaBelumDihantar || !allEvidensUploaded;
  let msgButangKedua = "";
  if (penilaianPertamaBelumDihantar && !allEvidensUploaded) {
    msgButangKedua = "Sila hantar Penilaian Pertama dahulu dan muat naik evidens untuk semua item.";
  } else if (penilaianPertamaBelumDihantar) {
    msgButangKedua = "Sila hantar Penilaian Pertama dahulu.";
  } else if (!allEvidensUploaded) {
    msgButangKedua = "Sila muat naik evidens untuk semua item sebelum menghantar.";
  }

  const readOnlyP1 = status !== STATUS.DRAFT;
  const readOnlyAkhir = status !== STATUS.DINILAI_1 && status !== STATUS.DIHANTAR_2;

  const ringkasan = useMemo(() => {
    const jumlahP1 = items.reduce((acc, r) => acc + (Number(r.penilaian_pertama) || 0), 0);
    const jumlahP2 = items.reduce((acc, r) => acc + (Number(r.penilaian_akhir) || 0), 0);
    const bilItem = items.length || 1;

    return {
      bilItem,
      jumlahP1,
      jumlahP2,
      purataP1: jumlahP1 / bilItem,
      purataP2: jumlahP2 / bilItem,
    };
  }, [items]);

  function badgeColor(s) {
    if (s === STATUS.DRAFT) return "#6b7280";
    if (s === STATUS.DIHANTAR_1) return "#2563eb";
    if (s === STATUS.DINILAI_1) return "#16a34a";
    if (s === STATUS.DIHANTAR_2) return "#7c3aed";
    if (s === STATUS.DINILAI_2) return "#059669";
    return "#6b7280";
  }

  if (loading) return <div style={{ padding: 20 }}>Memuatkan...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 10 }}>Borang Keberhasilan Guru</h1>

      <p style={{ margin: "4px 0 14px" }}>
        <b>Tahun:</b> {tahun} | <b>Status:</b>{" "}
        <span
          style={{
            background: badgeColor(status),
            color: "white",
            padding: "3px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {status}
        </span>
      </p>

      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Maklumat PYD</h3>
        <div style={grid2}>
          <InputField label="Nama PYD" value={maklumat.nama_pyd} onChange={(v) => updateMaklumat("nama_pyd", v)} disabled={status !== STATUS.DRAFT} />
          <InputField label="Gred" value={maklumat.gred} onChange={(v) => updateMaklumat("gred", v)} disabled={status !== STATUS.DRAFT} />
          <InputField label="No. K.P." value={maklumat.no_kp} onChange={(v) => updateMaklumat("no_kp", v)} disabled={status !== STATUS.DRAFT} />
          <InputField label="Tempat Bertugas" value={maklumat.tempat_bertugas} onChange={(v) => updateMaklumat("tempat_bertugas", v)} disabled={status !== STATUS.DRAFT} />
          <div style={{ gridColumn: "1 / span 2" }}>
            <InputField label="Jawatan" value={maklumat.jawatan} onChange={(v) => updateMaklumat("jawatan", v)} disabled={status !== STATUS.DRAFT} />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ marginTop: 0 }}>Perincian Sasaran Keberhasilan</h3>
          <button type="button" onClick={addItem} disabled={status !== STATUS.DRAFT}>+ Tambah Item</button>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table style={tableStyle}>
            <colgroup>
              <col style={{ width: "70px" }} />
              <col style={{ width: "240px" }} />
              <col style={{ width: "200px" }} />
              <col style={{ width: "220px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "220px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "170px" }} />
              <col style={{ width: "180px" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle}>BIL</th>
                <th style={thStyle}>BIDANG TUGAS / FUNGSI / AKAUNTABILITI</th>
                <th style={thStyle}>SASARAN KEBERHASILAN</th>
                <th style={thStyle}>PENCAPAIAN SEMASA PENILAIAN PERTAMA</th>
                <th style={thStyle}>PENILAIAN PERTAMA</th>
                <th style={thStyle}>STATUS SASARAN</th>
                <th style={thStyle}>PENCAPAIAN SEMASA PENILAIAN AKHIR</th>
                <th style={thStyle}>PENILAIAN AKHIR</th>
                <th style={thStyle}>CATATAN</th>
                <th style={thStyle}>TINDAKAN</th>
                <th style={thStyle}>EVIDENS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.id || `row-${i}`}>
                  <td style={tdStyle}>
                    <input type="number" style={{ ...inputCellSm, textAlign: "center" }} value={it.bil ?? i + 1} onChange={(e) => updateItem(i, "bil", e.target.value)} disabled={status !== STATUS.DRAFT} />
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={it.aspek || ""} onChange={(e) => updateItem(i, "aspek", e.target.value)} disabled={readOnlyP1} />
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={it.sasaran_keberhasilan || ""} onChange={(e) => updateItem(i, "sasaran_keberhasilan", e.target.value)} disabled={readOnlyP1} />
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={it.pencapaian_pertama || ""} onChange={(e) => updateItem(i, "pencapaian_pertama", e.target.value)} disabled={readOnlyP1} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" step="0.01" style={inputCellSm} value={it.penilaian_pertama ?? ""} onChange={(e) => updateItem(i, "penilaian_pertama", e.target.value)} disabled={readOnlyP1} />
                  </td>
                  <td style={tdStyle}>
                    <select style={inputCell} value={it.status_sasaran || ""} onChange={(e) => updateItem(i, "status_sasaran", e.target.value)} disabled={readOnlyP1}>
                      <option value="">-- Pilih --</option>
                      {STATUS_SASARAN_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={it.pencapaian_akhir || ""} onChange={(e) => updateItem(i, "pencapaian_akhir", e.target.value)} disabled={readOnlyAkhir} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" step="0.01" style={inputCellSm} value={it.penilaian_akhir ?? ""} onChange={(e) => updateItem(i, "penilaian_akhir", e.target.value)} disabled={readOnlyAkhir} />
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={it.catatan || ""} onChange={(e) => updateItem(i, "catatan", e.target.value)} disabled={readOnlyAkhir} />
                  </td>
                  <td style={tdStyle}>
                    <button type="button" onClick={() => removeItem(i)} disabled={status !== STATUS.DRAFT}>Buang</button>
                  </td>
                  <td style={tdStyle}>
                    {it.evidens_url ? (
                      <div style={{ fontSize: 12 }}>
                        <a href={it.evidens_url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all", color: "#2563eb" }}>
                          {it.evidens_path ? it.evidens_path.split("/").pop() : "Lihat Fail"}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeEvidens(i)}
                          disabled={uploadingIndex !== null}
                          style={{ marginTop: 4, display: "block", fontSize: 11, color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          Buang
                        </button>
                      </div>
                    ) : (
                      <label style={{ cursor: "pointer" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 10px",
                            background: uploadingIndex === i ? "#e5e7eb" : "#2563eb",
                            color: uploadingIndex === i ? "#6b7280" : "#fff",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: uploadingIndex === i ? "not-allowed" : "pointer",
                          }}
                        >
                          {uploadingIndex === i ? "Memuat naik..." : "Muat Naik"}
                        </span>
                        <input
                          type="file"
                          accept="*"
                          style={{ display: "none" }}
                          disabled={uploadingIndex !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadEvidens(i, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={11}>Tiada item.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Ringkasan</h3>
        <div style={summaryGrid}>
          <SummaryBox label="Bil Item" value={ringkasan.bilItem} />
          <SummaryBox label="Jumlah Penilaian Pertama" value={ringkasan.jumlahP1.toFixed(2)} />
          <SummaryBox label="Purata Penilaian Pertama" value={ringkasan.purataP1.toFixed(2)} />
          <SummaryBox label="Jumlah Penilaian Akhir" value={ringkasan.jumlahP2.toFixed(2)} />
          <SummaryBox label="Purata Penilaian Akhir" value={ringkasan.purataP2.toFixed(2)} />
        </div>

        <div style={{ marginTop: 10, fontSize: 14 }}>
          <div>Tarikh Penetapan Sasaran: {tarikhPenetapan || "-"}</div>
          <div>Tarikh Penilaian Pertama: {tarikhPenilaian1 || "-"}</div>
          <div>Tarikh Penilaian Akhir: {tarikhPenilaian2 || "-"}</div>
        </div>
      </div>

      <div className="no-print" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={simpanDraft} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Draft"}
        </button>

        {status === STATUS.DRAFT && (
          <button onClick={hantarPenilaian1} disabled={saving}>
            Hantar Penilaian Pertama
          </button>
        )}

        <button
          onClick={hantarPenilaianAkhir}
          disabled={saving || butangKeduaDisabled}
          title={msgButangKedua}
        >
          Hantar Penilaian Kedua
        </button>
        {msgButangKedua && (
          <span style={{ alignSelf: "center", fontSize: 12, color: "#dc2626" }}>
            {msgButangKedua}
          </span>
        )}

      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}

function InputField({ label, value, onChange, disabled }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <input style={inputCell} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    </label>
  );
}

function SummaryBox({ label, value }) {
  return (
    <div style={summaryBox}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const sectionStyle = {
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: 12,
  marginBottom: 12,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1880,
  tableLayout: "fixed",
};

const thStyle = {
  border: "1px solid #d1d5db",
  padding: 8,
  background: "#f3f4f6",
  textAlign: "left",
  verticalAlign: "top",
  fontSize: 12,
  lineHeight: 1.3,
};

const tdStyle = {
  border: "1px solid #d1d5db",
  padding: 6,
  verticalAlign: "top",
  background: "#fff",
};

const inputCell = {
  width: "100%",
  height: 36,
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  fontSize: 13,
};

const inputCellSm = {
  width: "100%",
  height: 36,
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  fontSize: 13,
};

const textCell = {
  width: "100%",
  minHeight: 96,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  resize: "vertical",
  fontSize: 13,
  lineHeight: 1.35,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const summaryBox = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 10,
  background: "#f9fafb",
};
