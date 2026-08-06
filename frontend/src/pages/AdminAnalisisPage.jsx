import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUserRole } from "../lib/useUserRole";
import { ASPEK_LIST, getTarafPdP } from "../data/tapakStandard4";
import {
  kiraSkorBerwajaran,
  kiraStatSubAspek,
  kiraStatAspek,
} from "../lib/skorUtil";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const TARAF_LIST = ["CEMERLANG", "BAIK", "SEDERHANA", "PERLU TINDAKAN SEGERA"];

const TARAF_WARNA = {
  CEMERLANG: "#16a34a",
  BAIK: "#2563eb",
  SEDERHANA: "#d97706",
  "PERLU TINDAKAN SEGERA": "#dc2626",
};

// Bina peta { guru_id: rekod } — utamakan rekod submitted, kemudian terkini
function binaPeta(rekodList) {
  const peta = {};
  (rekodList || []).forEach((r) => {
    if (!r.guru_id) return;
    const sedia = peta[r.guru_id];
    if (!sedia) {
      peta[r.guru_id] = r;
      return;
    }
    // utamakan submitted
    const sediaSub = sedia.status === "submitted";
    const baruSub = r.status === "submitted";
    if (baruSub && !sediaSub) {
      peta[r.guru_id] = r;
    } else if (baruSub === sediaSub) {
      // ambil yang terkini
      const t1 = new Date(sedia.updated_at || sedia.created_at || 0).getTime();
      const t2 = new Date(r.updated_at || r.created_at || 0).getTime();
      if (t2 >= t1) peta[r.guru_id] = r;
    }
  });
  return peta;
}

function skorRekod(rekod) {
  if (!rekod || !rekod.scores) return null;
  return kiraSkorBerwajaran(rekod.scores);
}

function fmtPct(v) {
  return v === null || v === undefined ? "-" : `${v.toFixed(1)}%`;
}

export default function AdminAnalisisPage() {
  const { isPentadbirOrAdmin, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [ralat, setRalat] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [petaKendiri, setPetaKendiri] = useState({});
  const [petaP1, setPetaP1] = useState({});
  const [petaP2, setPetaP2] = useState({});
  const [rawKendiri, setRawKendiri] = useState([]);
  const [rawP1, setRawP1] = useState([]);
  const [rawP2, setRawP2] = useState([]);

  useEffect(() => {
    if (roleLoading) return;
    if (!isPentadbirOrAdmin) {
      setLoading(false);
      return;
    }
    muatData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, isPentadbirOrAdmin]);

  async function muatData() {
    setLoading(true);
    setRalat("");
    try {
      const [k, p1, p2, prof] = await Promise.all([
        supabase.from("pencerapan_kendiri").select("*"),
        supabase.from("pencerapan_1").select("*"),
        supabase.from("pencerapan_2").select("*"),
        supabase.from("profiles").select("id, nama, jawatan, role"),
      ]);

      if (k.error || p1.error || p2.error || prof.error) {
        throw new Error(
          k.error?.message ||
            p1.error?.message ||
            p2.error?.message ||
            prof.error?.message ||
            "Ralat memuat data"
        );
      }

      setRawKendiri(k.data || []);
      setRawP1(p1.data || []);
      setRawP2(p2.data || []);
      setPetaKendiri(binaPeta(k.data));
      setPetaP1(binaPeta(p1.data));
      setPetaP2(binaPeta(p2.data));
      setProfiles(prof.data || []);
    } catch (e) {
      setRalat(e.message || "Ralat tidak diketahui");
    } finally {
      setLoading(false);
    }
  }

  // ---------- Keadaan akses / memuat ----------
  if (roleLoading || loading) {
    return (
      <div style={s.wrap}>
        <p>Sedang memuat data analisis…</p>
      </div>
    );
  }

  if (!isPentadbirOrAdmin) {
    return (
      <div style={s.wrap}>
        <h2 style={s.h1}>Akses Ditolak</h2>
        <p>Halaman ini hanya untuk pentadbir dan admin.</p>
      </div>
    );
  }

  if (ralat) {
    return (
      <div style={s.wrap}>
        <h2 style={s.h1}>Analisis</h2>
        <p style={{ color: "#dc2626" }}>Ralat: {ralat}</p>
      </div>
    );
  }

  // ---------- Kumpul senarai guru ----------
  const guruIdSet = new Set();
  profiles.forEach((p) => {
    if (p.role === "guru" || !p.role) guruIdSet.add(p.id);
  });
  [rawKendiri, rawP1, rawP2].forEach((list) =>
    list.forEach((r) => r.guru_id && guruIdSet.add(r.guru_id))
  );
  const guruIds = Array.from(guruIdSet);
  const profileMap = {};
  profiles.forEach((p) => (profileMap[p.id] = p));

  const jumlahGuru = guruIds.length;

  // ---------- Ringkasan per borang ----------
  function ringkas(raw, peta) {
    const submitted = raw.filter((r) => r.status === "submitted");
    const skors = submitted
      .map((r) => skorRekod(r))
      .filter((v) => v !== null && v !== undefined);
    const purata =
      skors.length > 0 ? skors.reduce((a, b) => a + b, 0) / skors.length : null;
    return {
      dihantar: submitted.length,
      belum: Math.max(jumlahGuru - submitted.length, 0),
      purata,
    };
  }
  const rKendiri = ringkas(rawKendiri, petaKendiri);
  const rP1 = ringkas(rawP1, petaP1);
  const rP2 = ringkas(rawP2, petaP2);

  // ---------- Jadual per guru ----------
  const barisGuru = guruIds.map((id) => {
    const prof = profileMap[id] || {};
    const sK = skorRekod(petaKendiri[id]);
    const sP1 = skorRekod(petaP1[id]);
    const sP2 = skorRekod(petaP2[id]);
    const skorTaraf = sP2 ?? sP1 ?? sK;
    const taraf = skorTaraf !== null && skorTaraf !== undefined ? getTarafPdP(skorTaraf) : null;
    return {
      id,
      nama: prof.nama || "-",
      jawatan: prof.jawatan || "-",
      sK,
      sP1,
      sP2,
      taraf,
    };
  });

  // ---------- Taburan taraf (berdasarkan P2 / terkini) ----------
  const taburan = { CEMERLANG: 0, BAIK: 0, SEDERHANA: 0, "PERLU TINDAKAN SEGERA": 0 };
  barisGuru.forEach((b) => {
    if (b.taraf && taburan[b.taraf] !== undefined) taburan[b.taraf] += 1;
  });

  // ---------- Statistik subAspek & aspek ----------
  const statSub = kiraStatSubAspek(petaKendiri, petaP1, petaP2, guruIds);
  const statAspek = kiraStatAspek(petaKendiri, petaP1, petaP2, guruIds);

  const cartaData = statAspek.map((a) => ({
    aspek: a.kod,
    Kendiri: a.avgKendiri !== null ? Number(a.avgKendiri.toFixed(1)) : 0,
    "Pencerapan 1": a.avgP1 !== null ? Number(a.avgP1.toFixed(1)) : 0,
    "Pencerapan 2": a.avgP2 !== null ? Number(a.avgP2.toFixed(1)) : 0,
  }));

  const adaData =
    rawKendiri.length > 0 || rawP1.length > 0 || rawP2.length > 0;

  return (
    <div style={s.wrap}>
      <h2 style={s.h1}>Analisis</h2>

      {!adaData && (
        <p style={s.tiada}>Tiada data pencerapan lagi.</p>
      )}

      {/* Kad ringkasan */}
      <div style={s.cardRow}>
        <div style={s.card}>
          <div style={s.cardLabel}>Jumlah Guru</div>
          <div style={s.cardBig}>{jumlahGuru}</div>
        </div>
        {[
          { tajuk: "Pencerapan Kendiri", r: rKendiri },
          { tajuk: "Pencerapan 1", r: rP1 },
          { tajuk: "Pencerapan 2", r: rP2 },
        ].map((x) => (
          <div style={s.card} key={x.tajuk}>
            <div style={s.cardLabel}>{x.tajuk}</div>
            <div style={s.cardLine}>
              Telah Dihantar: <b>{x.r.dihantar}</b>
            </div>
            <div style={s.cardLine}>
              Belum Dihantar: <b>{x.r.belum}</b>
            </div>
            <div style={s.cardLine}>
              Purata Skor: <b>{fmtPct(x.r.purata)}</b>
            </div>
          </div>
        ))}
      </div>

      {/* Carta bar per aspek */}
      <h3 style={s.h2}>Perbandingan Kendiri vs Pencerapan 1 vs Pencerapan 2</h3>
      <div style={s.chartBox}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={cartaData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="aspek" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <Bar dataKey="Kendiri" fill="#93c5fd" />
            <Bar dataKey="Pencerapan 1" fill="#2563eb" />
            <Bar dataKey="Pencerapan 2" fill="#1e3a8a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Taburan taraf */}
      <h3 style={s.h2}>Taburan Taraf</h3>
      <div style={s.cardRow}>
        {TARAF_LIST.map((t) => (
          <div style={{ ...s.card, borderTop: `3px solid ${TARAF_WARNA[t]}` }} key={t}>
            <div style={s.cardLabel}>{t}</div>
            <div style={s.cardBig}>{taburan[t]}</div>
          </div>
        ))}
      </div>

      {/* Jadual per guru */}
      <h3 style={s.h2}>Skor Mengikut Guru</h3>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Nama Guru</th>
              <th style={s.th}>Jawatan</th>
              <th style={s.th}>Skor Kendiri</th>
              <th style={s.th}>Skor P1</th>
              <th style={s.th}>Skor P2</th>
              <th style={s.th}>Taraf</th>
            </tr>
          </thead>
          <tbody>
            {barisGuru.length === 0 && (
              <tr>
                <td style={s.td} colSpan={6}>Tiada data</td>
              </tr>
            )}
            {barisGuru.map((b) => (
              <tr key={b.id}>
                <td style={s.td}>{b.nama}</td>
                <td style={s.td}>{b.jawatan}</td>
                <td style={s.td}>{fmtPct(b.sK)}</td>
                <td style={s.td}>{fmtPct(b.sP1)}</td>
                <td style={s.td}>{fmtPct(b.sP2)}</td>
                <td style={{ ...s.td, color: b.taraf ? TARAF_WARNA[b.taraf] : "#6b7280", fontWeight: 600 }}>
                  {b.taraf || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Jadual purata subAspek */}
      <h3 style={s.h2}>Skor Purata Mengikut SubAspek</h3>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Kod</th>
              <th style={s.th}>Standard Kualiti</th>
              <th style={s.th}>Kendiri</th>
              <th style={s.th}>P1</th>
              <th style={s.th}>P2</th>
            </tr>
          </thead>
          <tbody>
            {statSub.map((sa) => (
              <tr key={sa.kod}>
                <td style={s.td}>{sa.kod}</td>
                <td style={s.td}>{sa.standardKualiti}</td>
                <td style={s.td}>{fmtPct(sa.avgKendiri)}</td>
                <td style={s.td}>{fmtPct(sa.avgP1)}</td>
                <td style={s.td}>{fmtPct(sa.avgP2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  wrap: { padding: 20, maxWidth: 1100, margin: "0 auto" },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 16 },
  h2: { fontSize: 18, fontWeight: 700, margin: "28px 0 12px" },
  tiada: {
    background: "#fef3c7",
    border: "1px solid #fde68a",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
  },
  cardRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  card: {
    flex: "1 1 180px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  cardLabel: { fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 6 },
  cardBig: { fontSize: 28, fontWeight: 800, color: "#111827" },
  cardLine: { fontSize: 13, color: "#374151", marginTop: 2 },
  chartBox: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 14,
  },
  tableWrap: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "2px solid #e5e7eb",
    background: "#f9fafb",
    fontWeight: 700,
    color: "#374151",
  },
  td: {
    padding: "9px 12px",
    borderBottom: "1px solid #f1f5f9",
    color: "#111827",
  },
};
