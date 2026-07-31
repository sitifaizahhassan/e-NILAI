import React, { useState, useEffect } from "react";
import { ASPEK_LIST, getAllItems, getTarafPdP } from "../data/tapakStandard4";
import { kiraSkorBerwajaran } from "../lib/skorUtil";

const SCORE_LABELS = {
  4: "4 – Cemerlang",
  3: "3 – Baik",
  2: "2 – Sederhana",
  1: "1 – Perlu Penambahbaikan",
  0: "0 – Tidak Dicapai",
};

const SCORE_COLORS = {
  4: "#16a34a",
  3: "#2563eb",
  2: "#d97706",
  1: "#dc2626",
  0: "#6b7280",
};

export default function PencerapanForm({
  formType,
  initialData,
  guruProfile,
  onSave,
  onSubmit,
  loading,
  saving,
  msg,
  submittedAt,
  status,
  // Kawalan akses mengikut peranan
  canEditScores,
  canUploadFiles,
  canEditUlasan,
  // Ulasan pentadbir (P1 & P2 sahaja)
  showUlasan,
  ulasan,
  onUlasanChange,
  // RPH
  rphUrl,
  rphPath,
  uploadingRph,
  onUploadRph,
  onRemoveRph,
  // BBM
  bbmUrl,
  bbmPath,
  uploadingBbm,
  onUploadBbm,
  onRemoveBbm,
}) {
  const [maklumat, setMaklumat] = useState(
    initialData?.maklumat || {
      mata_pelajaran: "",
      kelas: "",
      tarikh_cerap: new Date().toISOString().slice(0, 10),
      nama_sekolah: "",
    }
  );
  const [scores, setScores] = useState(initialData?.scores || {});
  const [catatan, setCatatan] = useState(initialData?.catatan || "");
  const [expandedRubrik, setExpandedRubrik] = useState({});

  // Kemas kini state apabila initialData berubah (cth: admin pilih guru lain)
  useEffect(() => {
    if (initialData) {
      setMaklumat(initialData.maklumat || {
        mata_pelajaran: "",
        kelas: "",
        tarikh_cerap: new Date().toISOString().slice(0, 10),
        nama_sekolah: "",
      });
      setScores(initialData.scores || {});
      setCatatan(initialData.catatan || "");
    } else {
      setMaklumat({ mata_pelajaran: "", kelas: "", tarikh_cerap: new Date().toISOString().slice(0, 10), nama_sekolah: "" });
      setScores({});
      setCatatan("");
    }
    setExpandedRubrik({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const allItems = getAllItems();
  // canEditScores prop mengatasi logik status "submitted" sedia ada
  // Jika prop tidak dihantar, guna semakan status seperti biasa
  const isReadOnly = canEditScores !== undefined ? !canEditScores : status === "submitted";

  // Calculate total weighted score using shared utility
  function calcTotalScore() {
    return kiraSkorBerwajaran(scores);
  }

  const totalScore = calcTotalScore();
  const taraf = getTarafPdP(totalScore);

  const filledCount = allItems.filter(
    (item) => scores[item.id] !== null && scores[item.id] !== undefined
  ).length;
  const totalItems = allItems.length;

  function toggleRubrik(itemId) {
    setExpandedRubrik((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  function handleScore(itemId, val) {
    if (isReadOnly) return;
    setScores((prev) => ({ ...prev, [itemId]: val }));
  }

  function buildPayload(submitStatus) {
    return {
      maklumat,
      scores,
      catatan,
      status: submitStatus,
    };
  }

  const formTitles = {
    kendiri: "PENCERAPAN KENDIRI",
    "1": "PENCERAPAN 1",
    "2": "PENCERAPAN 2",
  };

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>
            TAPAK STANDARD 4 – {formTitles[formType] || "PENCERAPAN"}
          </h2>
          <p style={s.pageSubtitle}>PEMBELAJARAN DAN PEMUDAHCARAAN (PdPc)</p>
        </div>
        {status === "submitted" && (
          <span style={s.submittedBadge}>✓ Telah Dihantar</span>
        )}
        {status === "draft" && (
          <span style={s.draftBadge}>Draft</span>
        )}
      </div>

      {msg && (
        <div
          style={{
            ...s.msgBox,
            background: msg.toLowerCase().includes("ralat") ? "#fef2f2" : "#f0fdf4",
            borderColor: msg.toLowerCase().includes("ralat") ? "#fca5a5" : "#86efac",
            color: msg.toLowerCase().includes("ralat") ? "#dc2626" : "#16a34a",
          }}
        >
          {msg}
        </div>
      )}

      {/* Maklumat Section */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>Maklumat Pencerapan</h3>
        <div style={s.grid2}>
          <div style={s.field}>
            <label style={s.label}>Nama Guru</label>
            <input
              style={{ ...s.input, background: "#f9fafb" }}
              value={guruProfile?.nama || guruProfile?.email || "-"}
              readOnly
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Jawatan</label>
            <input
              style={{ ...s.input, background: "#f9fafb" }}
              value={guruProfile?.jawatan || "-"}
              readOnly
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Mata Pelajaran</label>
            <input
              style={s.input}
              value={maklumat.mata_pelajaran}
              onChange={(e) =>
                setMaklumat((p) => ({ ...p, mata_pelajaran: e.target.value }))
              }
              placeholder="Cth: Matematik"
              disabled={isReadOnly}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Kelas</label>
            <input
              style={s.input}
              value={maklumat.kelas}
              onChange={(e) =>
                setMaklumat((p) => ({ ...p, kelas: e.target.value }))
              }
              placeholder="Cth: 4 Amanah"
              disabled={isReadOnly}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Tarikh Pencerapan</label>
            <input
              style={s.input}
              type="date"
              value={maklumat.tarikh_cerap}
              onChange={(e) =>
                setMaklumat((p) => ({ ...p, tarikh_cerap: e.target.value }))
              }
              disabled={isReadOnly}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Nama Sekolah</label>
            <input
              style={s.input}
              value={maklumat.nama_sekolah}
              onChange={(e) =>
                setMaklumat((p) => ({ ...p, nama_sekolah: e.target.value }))
              }
              placeholder="Nama sekolah"
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={s.progressCard}>
        <div style={s.progressRow}>
          <span style={s.progressLabel}>
            Kemajuan: {filledCount} / {totalItems} item dinilai
          </span>
          <span style={{ fontWeight: 700, color: "#1d4ed8" }}>
            Skor: {totalScore.toFixed(1)}%
          </span>
          <span
            style={{
              ...s.tarafBadge,
              background:
                taraf === "CEMERLANG"
                  ? "#dcfce7"
                  : taraf === "BAIK"
                  ? "#dbeafe"
                  : taraf === "SEDERHANA"
                  ? "#fef9c3"
                  : "#fee2e2",
              color:
                taraf === "CEMERLANG"
                  ? "#16a34a"
                  : taraf === "BAIK"
                  ? "#1d4ed8"
                  : taraf === "SEDERHANA"
                  ? "#d97706"
                  : "#dc2626",
            }}
          >
            {taraf}
          </span>
        </div>
        <div style={s.progressTrack}>
          <div
            style={{
              ...s.progressFill,
              width: `${totalItems > 0 ? (filledCount / totalItems) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Arahan */}
      <div style={s.arahanBox}>
        <strong>ARAHAN:</strong> Sila tandakan skor pilihan anda (0–4) untuk setiap item mengikut pernyataan penskoran yang tertera.
      </div>

      {/* Aspek Sections */}
      {ASPEK_LIST.map((aspek) => (
        <div key={aspek.kod} style={s.aspekSection}>
          <div style={s.aspekHeader}>
            <h3 style={s.aspekTitle}>
              Aspek {aspek.kod}: {aspek.tajuk}
            </h3>
            <p style={s.aspekKriteria}>
              <strong>Kriteria Kritikal:</strong> {aspek.kriteria}
            </p>
          </div>

          {aspek.subAspek.map((sa) => (
            <div key={sa.kod} style={s.subAspekBox}>
              <div style={s.subAspekHeader}>
                <span style={s.subAspekKod}>{sa.kod}</span>
                <div>
                  <div style={s.subAspekStandard}>{sa.standardKualiti}</div>
                  <div style={s.subAspekWajaran}>Wajaran: {sa.wajaran}%</div>
                </div>
              </div>

              <div style={s.tindakanBox}>
                <strong>Tindakan:</strong> {sa.tindakan}
              </div>

              <p style={s.konteksText}>{sa.konteks}</p>

              {/* Score Header */}
              <div style={s.scoreHeaderRow}>
                <div style={{ flex: 1 }}>Tindakan / Item</div>
                {[4, 3, 2, 1, 0].map((sc) => (
                  <div key={sc} style={{ ...s.scoreHeaderCell, color: SCORE_COLORS[sc] }}>
                    {sc}
                  </div>
                ))}
                <div style={s.scoreHeaderCell}>Rubrik</div>
              </div>

              {sa.items.map((item) => {
                const currentScore = scores[item.id];
                const isExpanded = expandedRubrik[item.id];

                return (
                  <div key={item.id} style={s.itemRow}>
                    <div style={s.itemContent}>
                      <div style={s.itemLabelRow}>
                        <span style={s.itemLabel}>{item.label}</span>
                        <div style={s.radioGroup}>
                          {[4, 3, 2, 1, 0].map((sc) => (
                            <label
                              key={sc}
                              style={{
                                ...s.radioLabel,
                                background:
                                  currentScore === sc
                                    ? SCORE_COLORS[sc]
                                    : "#f1f5f9",
                                color: currentScore === sc ? "#fff" : "#374151",
                                opacity: isReadOnly ? 0.7 : 1,
                                cursor: isReadOnly ? "default" : "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name={item.id}
                                value={sc}
                                checked={currentScore === sc}
                                onChange={() => handleScore(item.id, sc)}
                                disabled={isReadOnly}
                                style={{ display: "none" }}
                              />
                              {sc}
                            </label>
                          ))}
                          <button
                            type="button"
                            onClick={() => toggleRubrik(item.id)}
                            style={s.rubrikBtn}
                            title="Lihat rubrik penskoran"
                          >
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        </div>
                      </div>

                      {currentScore !== null && currentScore !== undefined && (
                        <div style={s.selectedScore}>
                          <span
                            style={{
                              color: SCORE_COLORS[currentScore],
                              fontWeight: 600,
                            }}
                          >
                            Skor dipilih: {SCORE_LABELS[currentScore]}
                          </span>
                        </div>
                      )}

                      {isExpanded && (
                        <div style={s.rubrikBox}>
                          <div style={s.rubrikTitle}>Penskoran:</div>
                          {[4, 3, 2, 1, 0].map((sc) => (
                            <div
                              key={sc}
                              style={{
                                ...s.rubrikRow,
                                background:
                                  currentScore === sc ? "#f0f9ff" : "transparent",
                                borderLeft:
                                  currentScore === sc
                                    ? `3px solid ${SCORE_COLORS[sc]}`
                                    : "3px solid transparent",
                              }}
                            >
                              <span
                                style={{
                                  ...s.rubrikScore,
                                  color: SCORE_COLORS[sc],
                                }}
                              >
                                {sc}
                              </span>
                              <span style={s.rubrikDesc}>
                                {item.rubrik[sc]
                                  .split("\n")
                                  .map((line, i) => (
                                    <span key={i}>
                                      {line}
                                      {i <
                                        item.rubrik[sc].split("\n").length - 1 && <br />}
                                    </span>
                                  ))}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      {/* Catatan */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>Catatan / Ulasan</h3>
        <textarea
          style={s.textarea}
          rows={4}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Catatan tambahan (pilihan)..."
          disabled={isReadOnly}
        />
      </div>

      {/* Muat Naik RPH */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>📄 Muat Naik RPH (Rancangan Pengajaran Harian)</h3>
        {rphUrl ? (
          <div style={s.fileRow}>
            <a href={rphUrl} target="_blank" rel="noopener noreferrer" style={s.fileLink}>
              📎 {rphPath ? rphPath.split("/").pop() : "Lihat / Muat Turun RPH"}
            </a>
            {canUploadFiles && (
              <button
                type="button"
                style={s.btnRemoveFile}
                onClick={() => onRemoveRph && onRemoveRph()}
                title="Buang RPH"
              >
                🗑️ Buang
              </button>
            )}
          </div>
        ) : canUploadFiles ? (
          <div style={s.uploadRow}>
            <label style={s.uploadLabel}>
              <input
                type="file"
                accept="*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { onUploadRph && onUploadRph(file); e.target.value = ""; }
                }}
                disabled={uploadingRph}
              />
              {uploadingRph ? "⏳ Memuat naik RPH..." : "⬆️ Pilih Fail RPH"}
            </label>
            <span style={s.uploadHint}>Semua jenis fail diterima</span>
          </div>
        ) : (
          <p style={s.noFileText}>Tiada RPH dimuat naik.</p>
        )}
      </div>

      {/* Muat Naik BBM */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>🖼️ Muat Naik BBM (Bahan Bantu Mengajar)</h3>
        {bbmUrl ? (
          <div style={s.fileRow}>
            <a href={bbmUrl} target="_blank" rel="noopener noreferrer" style={s.fileLink}>
              📎 {bbmPath ? bbmPath.split("/").pop() : "Lihat / Muat Turun BBM"}
            </a>
            {canUploadFiles && (
              <button
                type="button"
                style={s.btnRemoveFile}
                onClick={() => onRemoveBbm && onRemoveBbm()}
                title="Buang BBM"
              >
                🗑️ Buang
              </button>
            )}
          </div>
        ) : canUploadFiles ? (
          <div style={s.uploadRow}>
            <label style={s.uploadLabel}>
              <input
                type="file"
                accept="*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { onUploadBbm && onUploadBbm(file); e.target.value = ""; }
                }}
                disabled={uploadingBbm}
              />
              {uploadingBbm ? "⏳ Memuat naik BBM..." : "⬆️ Pilih Fail BBM"}
            </label>
            <span style={s.uploadHint}>Semua jenis fail diterima</span>
          </div>
        ) : (
          <p style={s.noFileText}>Tiada BBM dimuat naik.</p>
        )}
      </div>

      {/* Ulasan Pentadbir (P1 & P2 sahaja) */}
      {showUlasan && (
        <div style={s.card}>
          <h3 style={s.cardTitle}>💬 Ulasan Pentadbir</h3>
          {canEditUlasan ? (
            <textarea
              style={s.textarea}
              rows={5}
              value={ulasan || ""}
              onChange={(e) => onUlasanChange && onUlasanChange(e.target.value)}
              placeholder="Tuliskan ulasan pentadbir di sini..."
            />
          ) : (
            <div style={s.ulasanReadOnly}>
              {ulasan ? ulasan : <span style={{ color: "#9ca3af" }}>Tiada ulasan pentadbir.</span>}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div style={s.summaryCard}>
        <h3 style={s.cardTitle}>Ringkasan Skor</h3>
        <div style={s.summaryGrid}>
          {ASPEK_LIST.map((aspek) =>
            aspek.subAspek.map((sa) => {
              const maxScore = sa.items.length * 4;
              const raw = sa.items.reduce((acc, item) => {
                const sc = scores[item.id];
                return acc + (sc !== null && sc !== undefined ? Number(sc) : 0);
              }, 0);
              const pct = maxScore > 0 ? (raw / maxScore) * 100 : 0;
              const weighted = (pct * sa.wajaran) / 100;
              return (
                <div key={sa.kod} style={s.summaryItem}>
                  <div style={s.summaryKod}>{sa.kod}</div>
                  <div style={s.summaryName}>
                    {aspek.tajuk}
                  </div>
                  <div style={s.summaryScore}>
                    {raw}/{maxScore} ({pct.toFixed(0)}%)
                  </div>
                  <div style={s.summaryWeighted}>
                    Wajaran: {weighted.toFixed(1)}/{sa.wajaran}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div style={s.totalRow}>
          <span style={s.totalLabel}>JUMLAH SKOR TAPAK STANDARD 4:</span>
          <span style={s.totalScore}>{totalScore.toFixed(2)}%</span>
          <span
            style={{
              ...s.tarafBadge,
              background:
                taraf === "CEMERLANG"
                  ? "#dcfce7"
                  : taraf === "BAIK"
                  ? "#dbeafe"
                  : taraf === "SEDERHANA"
                  ? "#fef9c3"
                  : "#fee2e2",
              color:
                taraf === "CEMERLANG"
                  ? "#16a34a"
                  : taraf === "BAIK"
                  ? "#1d4ed8"
                  : taraf === "SEDERHANA"
                  ? "#d97706"
                  : "#dc2626",
            }}
          >
            {taraf}
          </span>
        </div>
      </div>

      {/* Submission Info */}
      {submittedAt && (
        <div style={s.submittedInfo}>
          Borang telah dihantar pada:{" "}
          {new Date(submittedAt).toLocaleString("ms-MY")}
        </div>
      )}

      {/* Action Buttons */}
      {!isReadOnly && (
        <div style={s.actionBar}>
          <button
            type="button"
            style={s.btnDraft}
            onClick={() => onSave && onSave(buildPayload("draft"))}
            disabled={saving || loading}
          >
            {saving ? "Menyimpan..." : "💾 Simpan Draft"}
          </button>
          <button
            type="button"
            style={s.btnSubmit}
            onClick={() => {
              if (
                window.confirm(
                  "Hantar borang ini? Selepas dihantar, anda tidak boleh mengubah suai."
                )
              ) {
                onSubmit && onSubmit(buildPayload("submitted"));
              }
            }}
            disabled={saving || loading || filledCount < totalItems}
            title={
              filledCount < totalItems
                ? `Lengkapkan semua ${totalItems} item sebelum hantar`
                : "Hantar borang"
            }
          >
            {saving ? "Menghantar..." : "✅ Hantar Borang"}
          </button>
        </div>
      )}

      {!isReadOnly && filledCount < totalItems && (
        <p style={s.noteText}>
          * Sila lengkapkan semua {totalItems} item penilaian sebelum menghantar borang.
          ({totalItems - filledCount} item lagi)
        </p>
      )}
    </div>
  );
}

const s = {
  wrap: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "0 0 40px",
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  pageTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#1e3a5f",
  },
  pageSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  submittedBadge: {
    background: "#dcfce7",
    color: "#16a34a",
    padding: "6px 14px",
    borderRadius: 20,
    fontWeight: 600,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  draftBadge: {
    background: "#fef9c3",
    color: "#d97706",
    padding: "6px 14px",
    borderRadius: 20,
    fontWeight: 600,
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  msgBox: {
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 16,
    fontSize: 14,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    margin: "0 0 14px",
    fontSize: 16,
    fontWeight: 700,
    color: "#1e293b",
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
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
  },
  textarea: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  progressCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "14px 20px",
    marginBottom: 16,
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  progressLabel: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  tarafBadge: {
    padding: "4px 12px",
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    background: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#3b82f6",
    borderRadius: 999,
    transition: "width 0.3s",
  },
  arahanBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 16,
    fontSize: 14,
    color: "#1e40af",
  },
  aspekSection: {
    marginBottom: 24,
  },
  aspekHeader: {
    background: "#1e3a5f",
    color: "#fff",
    borderRadius: "10px 10px 0 0",
    padding: "14px 18px",
  },
  aspekTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
  },
  aspekKriteria: {
    margin: "6px 0 0",
    fontSize: 13,
    opacity: 0.9,
  },
  subAspekBox: {
    border: "1px solid #e2e8f0",
    borderTop: "none",
    borderRadius: "0 0 10px 10px",
    background: "#fff",
    marginBottom: 8,
    overflow: "hidden",
  },
  subAspekHeader: {
    display: "flex",
    gap: 14,
    padding: "12px 18px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    alignItems: "flex-start",
  },
  subAspekKod: {
    background: "#3b82f6",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
    whiteSpace: "nowrap",
    height: "fit-content",
  },
  subAspekStandard: {
    fontWeight: 600,
    fontSize: 14,
    color: "#1e293b",
  },
  subAspekWajaran: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  tindakanBox: {
    background: "#f0fdf4",
    borderBottom: "1px solid #bbf7d0",
    padding: "8px 18px",
    fontSize: 13,
    color: "#166534",
  },
  konteksText: {
    padding: "8px 18px",
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
    color: "#374151",
    background: "#fafafa",
    borderBottom: "1px solid #f1f5f9",
  },
  scoreHeaderRow: {
    display: "flex",
    alignItems: "center",
    padding: "8px 18px",
    background: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 13,
    fontWeight: 700,
    gap: 8,
  },
  scoreHeaderCell: {
    width: 38,
    textAlign: "center",
    fontWeight: 700,
  },
  itemRow: {
    borderBottom: "1px solid #f1f5f9",
  },
  itemContent: {
    padding: "12px 18px",
  },
  itemLabelRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    minWidth: 200,
  },
  radioGroup: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    flexShrink: 0,
  },
  radioLabel: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.15s",
    userSelect: "none",
  },
  rubrikBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    borderRadius: 6,
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: 12,
    color: "#64748b",
  },
  selectedScore: {
    marginTop: 6,
    fontSize: 13,
  },
  rubrikBox: {
    marginTop: 10,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 12,
  },
  rubrikTitle: {
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 8,
    color: "#374151",
  },
  rubrikRow: {
    display: "flex",
    gap: 12,
    padding: "6px 8px",
    borderRadius: 6,
    marginBottom: 4,
    alignItems: "flex-start",
  },
  rubrikScore: {
    fontWeight: 800,
    fontSize: 16,
    width: 24,
    flexShrink: 0,
    textAlign: "center",
  },
  rubrikDesc: {
    fontSize: 13,
    color: "#374151",
    whiteSpace: "pre-line",
  },
  summaryCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 10,
    marginBottom: 14,
  },
  summaryItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 12,
  },
  summaryKod: {
    fontWeight: 700,
    fontSize: 14,
    color: "#3b82f6",
    marginBottom: 4,
  },
  summaryName: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },
  summaryScore: {
    fontWeight: 600,
    fontSize: 14,
    color: "#1e293b",
  },
  summaryWeighted: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  totalRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 16px",
    background: "#1e3a5f",
    borderRadius: 8,
    color: "#fff",
    flexWrap: "wrap",
  },
  totalLabel: {
    flex: 1,
    fontWeight: 700,
    fontSize: 15,
  },
  totalScore: {
    fontSize: 24,
    fontWeight: 800,
    color: "#60a5fa",
  },
  submittedInfo: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    marginBottom: 12,
  },
  actionBar: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  btnDraft: {
    flex: 1,
    minWidth: 160,
    padding: "12px 20px",
    border: "2px solid #3b82f6",
    borderRadius: 10,
    background: "#fff",
    color: "#3b82f6",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  btnSubmit: {
    flex: 1,
    minWidth: 160,
    padding: "12px 20px",
    border: "none",
    borderRadius: 10,
    background: "#16a34a",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  noteText: {
    marginTop: 10,
    fontSize: 13,
    color: "#d97706",
    textAlign: "center",
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  fileLink: {
    color: "#1d4ed8",
    textDecoration: "underline",
    fontSize: 14,
    wordBreak: "break-all",
  },
  btnRemoveFile: {
    border: "1px solid #fca5a5",
    background: "#fff",
    color: "#dc2626",
    borderRadius: 6,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  uploadRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  uploadLabel: {
    display: "inline-block",
    padding: "8px 18px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    color: "#1d4ed8",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  uploadHint: {
    fontSize: 12,
    color: "#9ca3af",
  },
  noFileText: {
    fontSize: 14,
    color: "#9ca3af",
    margin: 0,
  },
  ulasanReadOnly: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 14,
    color: "#374151",
    minHeight: 80,
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
  },
};
