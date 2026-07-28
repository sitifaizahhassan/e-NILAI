import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/keberhasilan-print.css";

export default function KeberhasilanPrintablePage() {
  const { formId } = useParams();
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState(null);
  const [items, setItems] = useState([]);
  const hasAutoPrinted = useRef(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  useEffect(() => {
    if (!loading && form && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true;
      setTimeout(() => window.print(), 300);
    }
  }, [loading, form]);

  async function loadData() {
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
      setItems(itemData || []);
    } catch (e) {
      console.error(e);
      setMsg("Ralat load printable: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const count = items.length;
    const totalP1 = items.reduce((a, r) => a + (Number(r.penilaian_pertama) || 0), 0);
    const totalP2 = items.reduce((a, r) => a + (Number(r.penilaian_akhir) || 0), 0);
    const avgP1 = count ? totalP1 / count : 0;
    const avgP2 = count ? totalP2 / count : 0;
    return { count, totalP1, totalP2, avgP1, avgP2 };
  }, [items]);

  if (loading) return <div className="print-loading">Memuatkan borang...</div>;
  if (!form) return <div className="print-loading">Borang tidak dijumpai.</div>;

  return (
    <div className="print-root">
      <div className="k-print-page">
        <div className="k-print-toolbar no-print">
          <button onClick={() => window.print()}>Download / Print PDF</button>
        </div>

        <div className="k-sheet">
          {/* HEADER */}
          <div className="k-header">
            <div className="k-title-wrap">
              <h1 className="k-title">BORANG KEBERHASILAN</h1>
              <div className="k-subtitle">Penilaian Prestasi Tahunan</div>
            </div>
            <div className="k-logo-wrap">
              <img src="/logo-malaysia.png" alt="Logo" className="k-logo" />
            </div>
          </div>

          {/* INFO TABLE */}
          <table className="k-info-table">
            <tbody>
              <tr>
                <th>NAMA PYD</th>
                <td>{form.nama_pyd || "-"}</td>
                <th>GRED</th>
                <td>{form.gred || "-"}</td>
              </tr>
              <tr>
                <th>NO. K.P.</th>
                <td>{form.no_kp || "-"}</td>
                <th>TEMPAT BERTUGAS</th>
                <td>{form.tempat_bertugas || "-"}</td>
              </tr>
              <tr>
                <th>JAWATAN</th>
                <td>{form.jawatan || "-"}</td>
                <th>TAHUN</th>
                <td>{form.tahun || "-"}</td>
              </tr>
            </tbody>
          </table>

          {/* MAIN TABLE */}
          <table className="k-main-table">
            <colgroup>
              <col style={{ width: "16%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>BIDANG TUGAS/ FUNGSI/ AKAUNTABILITI</th>
                <th>BIL</th>
                <th>SASARAN KEBERHASILAN</th>
                <th>PENCAPAIAN SEMASA PENILAIAN PERTAMA</th>
                <th>
                  <span className="th-2line">
                    PENILAIAN
                    <br />
                    PERTAMA
                  </span>
                </th>
                <th>STATUS SASARAN</th>
                <th>PENCAPAIAN SEMASA PENILAIAN AKHIR</th>
                <th>
                  <span className="th-2line">
                    PENILAIAN
                    <br />
                    AKHIR
                  </span>
                </th>
                <th>CATATAN</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="k-empty">
                    Tiada item
                  </td>
                </tr>
              )}

              {items.map((r, i) => (
                <tr key={r.id || i}>
                  <td>{fmtBidang(r.aspek)}</td>
                  <td className="k-center">{r.bil ?? i + 1}</td>
                  <td>{r.sasaran_keberhasilan || ""}</td>
                  <td>{r.pencapaian_pertama || ""}</td>
                  <td className="k-center">{fmt(r.penilaian_pertama)}</td>
                  <td>{r.status_sasaran || ""}</td>
                  <td>{r.pencapaian_akhir || ""}</td>
                  <td className="k-center">{fmt(r.penilaian_akhir)}</td>
                  <td>{r.catatan || ""}</td>
                </tr>
              ))}

              {/* extra rows untuk tinggi jadual */}
              {Array.from({ length: Math.max(0, 10 - items.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="k-row-empty">
                  <td></td>
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SUMMARY TABLE */}
          <table className="k-summary-table">
            <colgroup>
              <col style={{ width: "19%" }} />
              <col style={{ width: "20.5%" }} />
              <col style={{ width: "20.5%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Bil Item</th>
                <th>Jumlah Penilaian Pertama</th>
                <th>Purata Penilaian Pertama</th>
                <th>Jumlah Penilaian Akhir</th>
                <th>Purata Penilaian Akhir</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{summary.count}</td>
                <td>{summary.totalP1.toFixed(2)}</td>
                <td>{summary.avgP1.toFixed(2)}</td>
                <td>{summary.totalP2.toFixed(2)}</td>
                <td>{summary.avgP2.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* SIGNATURE TABLE */}
          <table className="k-sign-table-exact">
            <colgroup>
              <col style={{ width: "23%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "19%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>TANDATANGAN DAN TARIKH</th>
                <th>PENETAPAN SASARAN</th>
                <th>PENILAIAN PERTAMA</th>
                <th>SEMAKAN SASARAN</th>
                <th>PENILAIAN AKHIR</th>
                <th>CATATAN</th>
              </tr>
            </thead>
            <tbody>
              <tr className="k-sign-name-row">
                <td className="k-sign-name">PYD</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr className="k-sign-space-row">
                <td className="k-sign-name">PP1</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div className="k-footer-note">
            Tarikh Penetapan: {form.tarikh_penetapan || "-"} | Tarikh Penilaian 1:{" "}
            {form.tarikh_penilaian_1 || "-"} | Tarikh Penilaian 2:{" "}
            {form.tarikh_penilaian_2 || "-"}
          </div>
        </div>

        {msg && <div className="print-loading">{msg}</div>}
      </div>
    </div>
  );
}

function fmt(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return "";
  return n.toFixed(2);
}

function fmtBidang(v) {
  const s = String(v || "").trim().toLowerCase();

  if (s === "1") return "Pengurusan dan Pentadbiran";
  if (s === "2") return "Kurikulum";
  if (s === "3") return "Hal Ehwal Murid";
  if (s === "4") return "Kokurikulum";

  if (s.includes("pengurusan") || s.includes("pentadbiran")) return "Pengurusan dan Pentadbiran";
  if (s.includes("kurikulum")) return "Kurikulum";
  if (s.includes("hal ehwal") || s.includes("hem")) return "Hal Ehwal Murid";
  if (s.includes("kokurikulum") || s.includes("ko-kurikulum")) return "Kokurikulum";

  return v || "-";
}