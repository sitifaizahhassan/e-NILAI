import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getWorkflowLabel, getWorkflowTone, getUserDisplayName } from "../lib/navigation";

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
});

export default function GuruKeberhasilanPage() {
  const location = useLocation();
  const { user, profile } = useOutletContext();
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
    if (user?.id) {
      initData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function getMaklumatSnapshot(formData = {}) {
    return {
      nama_pyd: formData.nama_pyd || getUserDisplayName(profile, user),
      no_kp: formData.no_kp || profile?.no_kp || "",
      jawatan: formData.jawatan || profile?.jawatan || "",
      gred: formData.gred || profile?.gred || "",
      tempat_bertugas: formData.tempat_bertugas || profile?.opsyen || "",
    };
  }

  async function initData() {
    setLoading(true);
    setMsg("");
    try {
      const { data: existing, error: findErr } = await supabase
        .from("keberhasilan_forms")
        .select("*")
        .eq("guru_id", user.id)
        .eq("tahun", tahun)
        .maybeSingle();

      if (findErr) throw findErr;

      let currentForm = existing;
      if (!currentForm) {
        const today = new Date().toISOString().slice(0, 10);
        const snapshot = getMaklumatSnapshot();
        const { data: created, error: createErr } = await supabase
          .from("keberhasilan_forms")
          .insert({
            guru_id: user.id,
            tahun,
            status: STATUS.DRAFT,
            tarikh_penetapan: today,
            ...snapshot,
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
      setMaklumat(getMaklumatSnapshot(currentForm));

      const { data: itemRows, error: itemErr } = await supabase
        .from("keberhasilan_items")
        .select("*")
        .eq("form_id", currentForm.id)
        .order("bil", { ascending: true, nullsFirst: false })
        .order("id", { ascending: true });

      if (itemErr) throw itemErr;

      setItems(
        !itemRows || itemRows.length === 0
          ? [EMPTY_ITEM(1), EMPTY_ITEM(2)]
          : itemRows.map((row, index) => ({
              id: row.id,
              bil: row.bil ?? index + 1,
              aspek: row.aspek || "",
              sasaran_keberhasilan: row.sasaran_keberhasilan || "",
              pencapaian_pertama: row.pencapaian_pertama || "",
              penilaian_pertama: row.penilaian_pertama ?? "",
              status_sasaran: row.status_sasaran || "",
              pencapaian_akhir: row.pencapaian_akhir || "",
              penilaian_akhir: row.penilaian_akhir ?? "",
              catatan: row.catatan || "",
            }))
      );
    } catch (error) {
      console.error(error);
      setMsg(`Ralat init data: ${error.message}`);
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
      return prev
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, bil: itemIndex + 1 }));
    });
  }

  function toNumberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isNaN(number) ? null : number;
  }

  async function upsertItems(currentFormId) {
    const { data: existingRows, error: fetchErr } = await supabase
      .from("keberhasilan_items")
      .select("id")
      .eq("form_id", currentFormId);

    if (fetchErr) throw fetchErr;

    const existingIds = (existingRows || []).map((row) => row.id);
    const currentIds = items.filter((item) => item.id).map((item) => item.id);
    const deletedIds = existingIds.filter((id) => !currentIds.includes(id));

    if (deletedIds.length > 0) {
      const { error: deleteErr } = await supabase.from("keberhasilan_items").delete().in("id", deletedIds);
      if (deleteErr) throw deleteErr;
    }

    const nextItems = [];
    for (let index = 0; index < items.length; index += 1) {
      const row = items[index];
      const payload = {
        form_id: currentFormId,
        bil: toNumberOrNull(row.bil) ?? index + 1,
        aspek: row.aspek,
        sasaran_keberhasilan: row.sasaran_keberhasilan,
        pencapaian_pertama: row.pencapaian_pertama,
        penilaian_pertama: toNumberOrNull(row.penilaian_pertama),
        status_sasaran: row.status_sasaran,
        pencapaian_akhir: row.pencapaian_akhir,
        penilaian_akhir: toNumberOrNull(row.penilaian_akhir),
        catatan: row.catatan,
      };

      if (row.id) {
        const { error } = await supabase.from("keberhasilan_items").update(payload).eq("id", row.id);
        if (error) throw error;
        nextItems.push({ ...row, bil: payload.bil });
      } else {
        const { data, error } = await supabase
          .from("keberhasilan_items")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        nextItems.push({ ...row, id: data.id, bil: payload.bil });
      }
    }

    setItems(nextItems);
  }

  async function simpanDraftSilently(nextStatus = STATUS.DRAFT) {
    const { error: formErr } = await supabase
      .from("keberhasilan_forms")
      .update({
        nama_pyd: maklumat.nama_pyd,
        no_kp: maklumat.no_kp,
        jawatan: maklumat.jawatan,
        gred: maklumat.gred,
        tempat_bertugas: maklumat.tempat_bertugas,
        status: nextStatus,
      })
      .eq("id", formId);

    if (formErr) throw formErr;
    await upsertItems(formId);
  }

  async function simpanDraft() {
    if (!formId || saving) return;
    try {
      setSaving(true);
      setMsg("");
      await simpanDraftSilently(STATUS.DRAFT);
      setStatus(STATUS.DRAFT);
      setMsg("Draft berjaya disimpan.");
    } catch (error) {
      console.error(error);
      setMsg(`Ralat simpan draft: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function hantarPenilaian1() {
    if (!formId || saving) return;

    try {
      setSaving(true);
      setMsg("");
      await simpanDraftSilently(STATUS.DRAFT);

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
      setMsg("Berjaya dihantar untuk penilaian pertama.");
    } catch (error) {
      console.error(error);
      setMsg(`Ralat hantar penilaian pertama: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function hantarPenilaianAkhir() {
    if (!formId || saving) return;

    if (status !== STATUS.DINILAI_1 && status !== STATUS.DIHANTAR_2) {
      setMsg("Penilaian akhir hanya boleh dihantar selepas penilaian pertama disemak.");
      return;
    }

    try {
      setSaving(true);
      setMsg("");
      await simpanDraftSilently(status);

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
      setMsg("Berjaya dihantar untuk penilaian akhir.");
    } catch (error) {
      console.error(error);
      setMsg(`Ralat hantar penilaian akhir: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  const readOnlyP1 = status !== STATUS.DRAFT;
  const readOnlyAkhir = status !== STATUS.DINILAI_1 && status !== STATUS.DIHANTAR_2;
  const printBasePath = location.pathname.startsWith("/admin") ? "/admin" : "/guru";

  const ringkasan = useMemo(() => {
    const jumlahP1 = items.reduce((acc, row) => acc + (Number(row.penilaian_pertama) || 0), 0);
    const jumlahP2 = items.reduce((acc, row) => acc + (Number(row.penilaian_akhir) || 0), 0);
    const bilItem = items.length || 1;

    return {
      bilItem,
      jumlahP1,
      jumlahP2,
      purataP1: jumlahP1 / bilItem,
      purataP2: jumlahP2 / bilItem,
    };
  }, [items]);

  if (loading) return <div className="loading">Memuatkan borang keberhasilan...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>Borang Keberhasilan</h2>
        <p style={{ margin: "4px 0" }}>
          <b>Pengguna:</b> {getUserDisplayName(profile, user)}
        </p>
        <p style={{ margin: "4px 0" }}>
          <b>Tahun:</b> {tahun}
        </p>
        <p style={{ margin: "4px 0 0" }}>
          <b>Status:</b>{" "}
          <span
            style={{
              background: getWorkflowTone(status),
              color: "white",
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {getWorkflowLabel(status)}
          </span>
        </p>
      </section>

      <section style={sectionStyle}>
        <h3 style={{ marginTop: 0 }}>Maklumat PYD</h3>
        <p style={{ color: "#64748b", marginTop: 0 }}>
          Maklumat ini boleh dikemas kini di halaman Profil Guru dan diselaraskan pada borang ini.
        </p>
        <div style={grid2}>
          <InputField label="Nama PYD" value={maklumat.nama_pyd} onChange={(value) => updateMaklumat("nama_pyd", value)} disabled={status !== STATUS.DRAFT} />
          <InputField label="Gred" value={maklumat.gred} onChange={(value) => updateMaklumat("gred", value)} disabled={status !== STATUS.DRAFT} />
          <InputField label="No. K.P." value={maklumat.no_kp} onChange={(value) => updateMaklumat("no_kp", value)} disabled={status !== STATUS.DRAFT} />
          <InputField label="Tempat Bertugas / Opsyen" value={maklumat.tempat_bertugas} onChange={(value) => updateMaklumat("tempat_bertugas", value)} disabled={status !== STATUS.DRAFT} />
          <div style={{ gridColumn: "1 / span 2" }}>
            <InputField label="Jawatan" value={maklumat.jawatan} onChange={(value) => updateMaklumat("jawatan", value)} disabled={status !== STATUS.DRAFT} />
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 style={{ marginTop: 0 }}>Perincian Sasaran Keberhasilan</h3>
          <button type="button" className="refresh-btn" onClick={addItem} disabled={status !== STATUS.DRAFT}>
            + Tambah Item
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <colgroup>
              <col style={{ width: "70px" }} />
              <col style={{ width: "240px" }} />
              <col style={{ width: "200px" }} />
              <col style={{ width: "220px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "220px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "170px" }} />
              <col style={{ width: "90px" }} />
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
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || `row-${index}`}>
                  <td style={tdStyle}>
                    <input type="number" style={{ ...inputCellSm, textAlign: "center" }} value={item.bil ?? index + 1} onChange={(event) => updateItem(index, "bil", event.target.value)} disabled={status !== STATUS.DRAFT} />
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={item.aspek || ""} onChange={(event) => updateItem(index, "aspek", event.target.value)} disabled={readOnlyP1} />
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={item.sasaran_keberhasilan || ""} onChange={(event) => updateItem(index, "sasaran_keberhasilan", event.target.value)} disabled={readOnlyP1} />
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={item.pencapaian_pertama || ""} onChange={(event) => updateItem(index, "pencapaian_pertama", event.target.value)} disabled={readOnlyP1} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" step="0.01" style={inputCellSm} value={item.penilaian_pertama ?? ""} onChange={(event) => updateItem(index, "penilaian_pertama", event.target.value)} disabled={readOnlyP1} />
                  </td>
                  <td style={tdStyle}>
                    <select style={inputCell} value={item.status_sasaran || ""} onChange={(event) => updateItem(index, "status_sasaran", event.target.value)} disabled={readOnlyP1}>
                      <option value="">-- Pilih --</option>
                      {STATUS_SASARAN_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={item.pencapaian_akhir || ""} onChange={(event) => updateItem(index, "pencapaian_akhir", event.target.value)} disabled={readOnlyAkhir} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" step="0.01" style={inputCellSm} value={item.penilaian_akhir ?? ""} onChange={(event) => updateItem(index, "penilaian_akhir", event.target.value)} disabled={readOnlyAkhir} />
                  </td>
                  <td style={tdStyle}>
                    <textarea style={textCell} value={item.catatan || ""} onChange={(event) => updateItem(index, "catatan", event.target.value)} disabled={readOnlyAkhir} />
                  </td>
                  <td style={tdStyle}>
                    <button type="button" className="refresh-btn" onClick={() => removeItem(index)} disabled={status !== STATUS.DRAFT}>
                      Buang
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={sectionStyle}>
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
      </section>

      <div className="no-print" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="refresh-btn" onClick={simpanDraft} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Draft"}
        </button>

        {status === STATUS.DRAFT && (
          <button className="refresh-btn" onClick={hantarPenilaian1} disabled={saving}>
            Hantar Penilaian Pertama
          </button>
        )}

        {(status === STATUS.DINILAI_1 || status === STATUS.DIHANTAR_2) && (
          <button className="refresh-btn" onClick={hantarPenilaianAkhir} disabled={saving}>
            Hantar Penilaian Akhir
          </button>
        )}

        <button
          className="refresh-btn"
          onClick={() => {
            const url = `${printBasePath}/keberhasilan/print/${formId}`;
            const popup = window.open(url, "_blank", "noopener,noreferrer");
            if (!popup) window.location.href = url;
          }}
          disabled={!formId}
        >
          Download Borang
        </button>
      </div>

      {msg && <div className="dashboard-inline-alert">{msg}</div>}
    </div>
  );
}

function InputField({ label, value, onChange, disabled }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <input style={inputCell} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
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
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1700,
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
  ...inputCell,
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
