import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import * as XLSX from "xlsx";
import "../styles/admin-keberhasilan.css";

export default function AdminKeberhasilanPage() {
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [form, setForm] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [viewMode, setViewMode] = useState("edit");

  useEffect(() => {
    loadForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadForms() {
    setLoading(true);
    setMsg("");
    try {
      const { data, error } = await supabase
        .from("keberhasilan_forms")
        .select("*")
        .eq("tahun", Number(tahun))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setForms(data || []);

      if (data?.length) {
        await openForm(data[0].id);
      } else {
        setSelectedFormId(null);
        setForm(null);
        setItems([]);
      }
    } catch (e) {
      console.error(e);
      setMsg("Ralat load senarai borang: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openForm(formId) {
    setSelectedFormId(formId);
    setLoading(true);
    setMsg("");
    try {
      const { data: formData, error: formErr } = await supabase
        .from("keberhasilan_forms")
        .select("*")
        .eq("id", formId)
        .single();
      if (formErr) throw formErr;

      const { data: itemData, error: itemErr } = await supabase
        .from("keberhasilan_items")
        .select("*")
        .eq("form_id", formId)
        .order("bil", { ascending: true, nullsFirst: false })
        .order("id", { ascending: true });

      if (itemErr) throw itemErr;

      setForm(formData);
      setItems((itemData || []).map((x) => ({ ...x })));
    } catch (e) {
      console.error(e);
      setMsg("Ralat buka borang: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function updateItem(index, field, value) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  const summary = useMemo(() => {
    const count = items.length;
    const totalP1 = items.reduce((a, r) => a + (Number(r.penilaian_pertama) || 0), 0);
    const totalP2 = items.reduce((a, r) => a + (Number(r.penilaian_akhir) || 0), 0);
    const avgP1 = count ? totalP1 / count : 0;
    const avgP2 = count ? totalP2 / count : 0;
    return { count, totalP1, totalP2, avgP1, avgP2 };
  }, [items]);

  async function handleSaveAdmin() {
    if (!form?.id) return;
    setSaving(true);
    setMsg("");

    try {
      for (const r of items) {
        const payload = {
          aspek: r.aspek ?? "",
          sasaran_keberhasilan: r.sasaran_keberhasilan ?? "",
          pencapaian_pertama: r.pencapaian_pertama ?? "",
          penilaian_pertama: toNumOrNull(r.penilaian_pertama),
          status_sasaran: r.status_sasaran ?? "",
          pencapaian_akhir: r.pencapaian_akhir ?? "",
          penilaian_akhir: toNumOrNull(r.penilaian_akhir),
          catatan: r.catatan ?? "",
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("keberhasilan_items")
          .update(payload)
          .eq("id", r.id);

        if (error) throw error;
      }

      const { error: formErr } = await supabase
        .from("keberhasilan_forms")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", form.id);

      if (formErr) throw formErr;

      setMsg("Berjaya simpan semakan admin.");
      await openForm(form.id);
      await loadForms();
    } catch (e) {
      console.error(e);
      setMsg("Ralat simpan: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleResetDraft() {
    if (!form?.id) return;
    if (!window.confirm("Set semula status borang kepada DRAFT?")) return;

    setSaving(true);
    setMsg("");

    try {
      const { error } = await supabase
        .from("keberhasilan_forms")
        .update({
          status: "DRAFT",
          updated_at: new Date().toISOString(),
        })
        .eq("id", form.id);

      if (error) throw error;

      setMsg("Status berjaya ditukar ke DRAFT.");
      await openForm(form.id);
      await loadForms();
    } catch (e) {
      console.error(e);
      setMsg("Ralat set semula draft: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDownloadPdfView() {
    if (!form?.id) return;
    window.open(`/admin/keberhasilan/print/${form.id}`, "_blank");
  }

  async function handleDownloadExcel() {
    if (!form) return;

    try {
      const res = await fetch("/templates/BORANG_KEBERHASILAN_TEMPLATE.xlsx");
      if (!res.ok) {
        alert("Template Excel tak jumpa. Semak public/templates/BORANG_KEBERHASILAN_TEMPLATE.xlsx");
        return;
      }

      const buf = await res.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });

      // Guna sheet utama template
      const ws = wb.Sheets["BORANG KEBERHASILAN"] || wb.Sheets[wb.SheetNames[0]];
      if (!ws) {
        alert("Sheet template tidak dijumpai.");
        return;
      }

      // ===============================
      // Mapping HEADER (disahkan)
      // ===============================
      ws["B5"] = { t: "s", v: form.nama_pyd || "-" };
      ws["B6"] = { t: "s", v: form.no_kp || "-" };
      ws["B7"] = { t: "s", v: form.jawatan || "-" };
      ws["H5"] = { t: "s", v: form.gred || "-" };
      ws["H6"] = { t: "s", v: form.tempat_bertugas || "-" };

      // ===============================
      // Mapping JADUAL ITEM
      // Start row = 9, kolum A..I
      // ===============================
      const startRow = 9;
      const maxRows = 6; // ikut template sample anda (row 9 hingga 14)

      for (let i = 0; i < maxRows; i++) {
        const row = startRow + i;
        const r = items[i] || {};

        ws[`A${row}`] = { t: "s", v: r.aspek ? fmtBidang(r.aspek) : "" };
        ws[`B${row}`] = { t: "n", v: Number(r.bil ?? (r.aspek || r.sasaran_keberhasilan ? i + 1 : "")) || "" };
        ws[`C${row}`] = { t: "s", v: r.sasaran_keberhasilan || "" };
        ws[`D${row}`] = { t: "s", v: r.pencapaian_pertama || "" };
        ws[`E${row}`] = { t: "n", v: toNumOrBlank(r.penilaian_pertama) };
        ws[`F${row}`] = { t: "s", v: r.status_sasaran || "" };
        ws[`G${row}`] = { t: "s", v: r.pencapaian_akhir || "" };
        ws[`H${row}`] = { t: "n", v: toNumOrBlank(r.penilaian_akhir) };
        ws[`I${row}`] = { t: "s", v: r.catatan || "" };
      }

      // ===============================
      // Mapping RINGKASAN (ikut template screenshot)
      // ===============================
      ws["G15"] = { t: "n", v: summary.count || 0 };                  // Bilangan sasaran dinilai (pertama)
      ws["H15"] = { t: "n", v: summary.count || 0 };                  // Bilangan sasaran dinilai (akhir)

      ws["G16"] = { t: "n", v: round2(summary.totalP1) };             // Jumlah markah pertama
      ws["H16"] = { t: "n", v: round2(summary.totalP2) };             // Jumlah markah akhir

      ws["G17"] = { t: "n", v: round2(summary.avgP1) };               // Purata pencapaian pertama
      ws["H17"] = { t: "n", v: round2(summary.avgP2) };               // Purata pencapaian akhir

      // Skor contoh (jika template guna baris ni)
      ws["G18"] = { t: "n", v: scoreBand(summary.avgP1) };
      ws["H18"] = { t: "n", v: scoreBand(summary.avgP2) };

      // Set format nombor ringkas
      setNumFmt(ws, ["G16", "H16", "G17", "H17"], "0.00");

      const safeNama = String(form?.nama_pyd || "PYD").replace(/[^\w\- ]/g, "");
      const fileName = `BORANG_KEBERHASILAN_${safeNama}_${form?.tahun || ""}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error(err);
      alert("Ralat export Excel: " + (err?.message || "Unknown error"));
    }
  }

  return (
    <div className="ak-page">
      <h2 className="ak-title">ADMIN SEMAKAN KEBERHASILAN</h2>

      <div className="ak-toolbar">
        <label>Tahun:</label>
        <input
          type="number"
          value={tahun}
          onChange={(e) => setTahun(e.target.value)}
          className="ak-year"
        />
        <button onClick={loadForms}>Refresh</button>
      </div>

      <section className="ak-card">
        <h3>Senarai Borang ({forms.length})</h3>
        <table className="ak-table">
          <thead>
            <tr>
              <th>ID Form</th>
              <th>Guru ID</th>
              <th>Nama PYD</th>
              <th>Tahun</th>
              <th>Status</th>
              <th>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {forms.length === 0 ? (
              <tr><td colSpan={6} className="ak-empty">Tiada borang</td></tr>
            ) : (
              forms.map((f) => (
                <tr key={f.id} className={selectedFormId === f.id ? "is-active" : ""}>
                  <td>{f.id}</td>
                  <td>{f.guru_id}</td>
                  <td>{f.nama_pyd || ""}</td>
                  <td>{f.tahun}</td>
                  <td><span className="ak-pill">{f.status || "DRAFT"}</span></td>
                  <td><button onClick={() => openForm(f.id)}>Buka</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="ak-card">
        <div className="ak-head-row">
          <h3>Detail Borang</h3>

          <div className="ak-view-toggle">
            <button
              type="button"
              className={viewMode === "edit" ? "active" : ""}
              onClick={() => setViewMode("edit")}
            >
              Edit
            </button>
            <button
              type="button"
              className={viewMode === "preview" ? "active" : ""}
              onClick={() => setViewMode("preview")}
            >
              Borang Sebenar
            </button>
          </div>
        </div>

        {!form ? (
          <div>Sila pilih borang.</div>
        ) : (
          <>
            <div className="ak-meta">
              <p><b>ID Form:</b> {form.id}</p>
              <p><b>Guru ID:</b> {form.guru_id}</p>
              <p>
                <b>Nama PYD:</b> {form.nama_pyd || "-"} | <b>No KP:</b> {form.no_kp || "-"} |{" "}
                <b>Jawatan:</b> {form.jawatan || "-"} | <b>Gred:</b> {form.gred || "-"} |{" "}
                <b>Tempat Bertugas:</b> {form.tempat_bertugas || "-"}
              </p>
              <p><b>Status:</b> <span className="ak-pill">{form.status || "DRAFT"}</span></p>
            </div>

            {viewMode === "edit" ? (
              <>
                <div className="ak-scroll">
                  <table className="ak-table ak-edit-table">
                    <thead>
                      <tr>
                        <th>BIL</th>
                        <th>BIDANG TUGAS/FUNGSI/AKAUNTABILITI</th>
                        <th>SASARAN KEBERHASILAN</th>
                        <th>PENCAPAIAN SEMASA PENILAIAN PERTAMA</th>
                        <th>PENILAIAN PERTAMA</th>
                        <th>STATUS SASARAN</th>
                        <th>PENCAPAIAN SEMASA PENILAIAN AKHIR</th>
                        <th>PENILAIAN AKHIR</th>
                        <th>CATATAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((r, i) => (
                        <tr key={r.id || i}>
                          <td>{r.bil ?? i + 1}</td>
                          <td><textarea value={r.aspek || ""} onChange={(e) => updateItem(i, "aspek", e.target.value)} rows={3} /></td>
                          <td><textarea value={r.sasaran_keberhasilan || ""} onChange={(e) => updateItem(i, "sasaran_keberhasilan", e.target.value)} rows={3} /></td>
                          <td><textarea value={r.pencapaian_pertama || ""} onChange={(e) => updateItem(i, "pencapaian_pertama", e.target.value)} rows={3} /></td>
                          <td><input type="number" step="0.01" value={r.penilaian_pertama ?? ""} onChange={(e) => updateItem(i, "penilaian_pertama", e.target.value)} /></td>
                          <td>
                            <select value={r.status_sasaran || ""} onChange={(e) => updateItem(i, "status_sasaran", e.target.value)}>
                              <option value="">-- Pilih --</option>
                              <option value="TERCAPAI">TERCAPAI</option>
                              <option value="SEBAHAGIAN TERCAPAI">SEBAHAGIAN TERCAPAI</option>
                              <option value="TIDAK TERCAPAI">TIDAK TERCAPAI</option>
                            </select>
                          </td>
                          <td><textarea value={r.pencapaian_akhir || ""} onChange={(e) => updateItem(i, "pencapaian_akhir", e.target.value)} rows={3} /></td>
                          <td><input type="number" step="0.01" value={r.penilaian_akhir ?? ""} onChange={(e) => updateItem(i, "penilaian_akhir", e.target.value)} /></td>
                          <td><textarea value={r.catatan || ""} onChange={(e) => updateItem(i, "catatan", e.target.value)} rows={3} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <SummaryBoxes summary={summary} />

                <div className="k-action-bar">
                  <button type="button" className="k-btn k-btn-primary" onClick={handleSaveAdmin} disabled={saving || loading}>
                    {saving ? "Menyimpan..." : "Simpan Semakan Admin"}
                  </button>
                  <button type="button" className="k-btn k-btn-secondary" onClick={handleResetDraft} disabled={saving || loading}>
                    Set Semula ke Draft
                  </button>
                  <button type="button" className="k-btn k-btn-success" onClick={handleDownloadPdfView} disabled={!form?.id || loading}>
                    Download Borang (PDF)
                  </button>
                  <button type="button" className="k-btn k-btn-excel" onClick={handleDownloadExcel} disabled={!form?.id || loading}>
                    Download Excel (Template)
                  </button>
                </div>
              </>
            ) : (
              <BorangSebenarPreview form={form} items={items} summary={summary} />
            )}
          </>
        )}
      </section>

      {loading && <p>Memuatkan...</p>}
      {msg && <p>{msg}</p>}
    </div>
  );
}

function SummaryBoxes({ summary }) {
  return (
    <div className="ak-summary-grid">
      <div className="ak-summary-box"><div>Bil Item</div><strong>{summary.count}</strong></div>
      <div className="ak-summary-box"><div>Jumlah Penilaian Pertama</div><strong>{summary.totalP1.toFixed(2)}</strong></div>
      <div className="ak-summary-box"><div>Purata Penilaian Pertama</div><strong>{summary.avgP1.toFixed(2)}</strong></div>
      <div className="ak-summary-box"><div>Jumlah Penilaian Akhir</div><strong>{summary.totalP2.toFixed(2)}</strong></div>
      <div className="ak-summary-box"><div>Purata Penilaian Akhir</div><strong>{summary.avgP2.toFixed(2)}</strong></div>
    </div>
  );
}

function BorangSebenarPreview({ form, items, summary }) {
  return (
    <div className="k-form-preview-wrap">
      <div className="k-sheet-like">
        <h4 style={{ margin: 0 }}>Preview Borang Sebenar</h4>
        <p style={{ margin: "6px 0" }}>
          {form?.nama_pyd || "-"} | {form?.no_kp || "-"} | {form?.jawatan || "-"} | {form?.gred || "-"}
        </p>
        <p style={{ margin: "6px 0" }}>
          Bil item: {summary.count} | Purata 1: {summary.avgP1.toFixed(2)} | Purata 2: {summary.avgP2.toFixed(2)}
        </p>
        <div style={{ fontSize: 12, color: "#555" }}>
          (Preview ringkas. Export Excel guna template rasmi.)
        </div>
      </div>
    </div>
  );
}

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function toNumOrBlank(v) {
  if (v === "" || v === null || v === undefined) return "";
  const n = Number(v);
  return Number.isNaN(n) ? "" : n;
}

function round2(v) {
  const n = Number(v || 0);
  return Math.round(n * 100) / 100;
}

// contoh band skor, boleh ubah ikut polisi sebenar anda
function scoreBand(avg) {
  const n = Number(avg || 0);
  if (n >= 90) return 5;
  if (n >= 80) return 4;
  if (n >= 70) return 3;
  if (n >= 60) return 2;
  return 1;
}

function setNumFmt(ws, addresses, z = "0.00") {
  addresses.forEach((addr) => {
    if (!ws[addr]) ws[addr] = { t: "n", v: 0 };
    ws[addr].z = z;
  });
}

function fmtBidang(v) {
  const s = String(v || "").trim().toLowerCase();
  if (s === "1") return "PENGURUSAN DAN PENTADBIRAN";
  if (s === "2") return "KURIKULUM";
  if (s === "3") return "HAL EHWAL MURID";
  if (s === "4") return "KOKURIKULUM";
  if (s.includes("pengurusan") || s.includes("pentadbiran")) return "PENGURUSAN DAN PENTADBIRAN";
  if (s.includes("kurikulum")) return "KURIKULUM";
  if (s.includes("hal ehwal") || s.includes("hem")) return "HAL EHWAL MURID";
  if (s.includes("kokurikulum") || s.includes("ko-kurikulum")) return "KOKURIKULUM";
  return v || "";
}