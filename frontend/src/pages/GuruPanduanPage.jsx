import React from "react";
import { ASPEK_LIST, getAllItems } from "../data/tapakStandard4";

export default function GuruPanduanPage() {
  const totalItems = getAllItems().length;

  return (
    <div style={s.wrap}>
      <h2 style={s.title}>📘 Panduan Penggunaan Borang Pencerapan</h2>

      <div style={s.card}>
        <h3 style={s.cardTitle}>Apakah TAPAK STANDARD 4?</h3>
        <p style={s.text}>
          TAPAK STANDARD 4 adalah instrumen penilaian kualiti Pembelajaran dan Pemudahcaraan (PdPc)
          berdasarkan SKPM (Standard Kualiti Pendidikan Malaysia) Kualiti@Sekolah. Ia mengukur
          prestasi guru dalam 6 aspek utama dengan jumlah wajaran 100%.
        </p>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>Aspek-Aspek Penilaian</h3>
        <div style={s.aspekGrid}>
          {ASPEK_LIST.map((aspek) => {
            const totalWajaran = aspek.subAspek.reduce((sum, sa) => sum + sa.wajaran, 0);
            return (
              <div key={aspek.kod} style={s.aspekCard}>
                <div style={s.aspekKod}>{aspek.kod}</div>
                <div style={s.aspekTajuk}>{aspek.tajuk}</div>
                <div style={s.aspekWajaran}>Wajaran: {totalWajaran}%</div>
                <div style={s.aspekItems}>
                  {aspek.subAspek.map((sa) => (
                    <div key={sa.kod} style={s.subItem}>
                      <span style={s.subKod}>{sa.kod}</span>
                      <span style={s.subName}>{sa.standardKualiti}</span>
                      <span style={s.subWajaran}>{sa.wajaran}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>Sistem Penskoran</h3>
        <div style={s.scoreTable}>
          {[
            { score: 4, label: "Cemerlang", desc: "Semua kriteria dipenuhi", color: "#16a34a", bg: "#dcfce7" },
            { score: 3, label: "Baik", desc: "Kebanyakan kriteria dipenuhi", color: "#2563eb", bg: "#dbeafe" },
            { score: 2, label: "Sederhana", desc: "Sebahagian kriteria dipenuhi", color: "#d97706", bg: "#fef9c3" },
            { score: 1, label: "Perlu Penambahbaikan", desc: "Sedikit kriteria dipenuhi", color: "#dc2626", bg: "#fee2e2" },
            { score: 0, label: "Tidak Dicapai", desc: "Tiada kriteria dipenuhi", color: "#6b7280", bg: "#f3f4f6" },
          ].map((item) => (
            <div key={item.score} style={{ ...s.scoreRow, background: item.bg }}>
              <span style={{ ...s.scoreNum, color: item.color }}>{item.score}</span>
              <span style={{ ...s.scoreLabel, color: item.color }}>{item.label}</span>
              <span style={s.scoreDesc}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>Taraf PdP</h3>
        <div style={s.tarafTable}>
          {[
            { taraf: "CEMERLANG", range: "85.00 – 100.00%", color: "#16a34a", bg: "#dcfce7" },
            { taraf: "BAIK", range: "70.00 – 84.99%", color: "#2563eb", bg: "#dbeafe" },
            { taraf: "SEDERHANA", range: "55.00 – 69.99%", color: "#d97706", bg: "#fef9c3" },
            { taraf: "PERLU TINDAKAN SEGERA", range: "0 – 54.99%", color: "#dc2626", bg: "#fee2e2" },
          ].map((item) => (
            <div key={item.taraf} style={{ ...s.tarafRow, background: item.bg }}>
              <span style={{ ...s.tarafName, color: item.color }}>{item.taraf}</span>
              <span style={s.tarafRange}>{item.range}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>Cara Mengisi Borang</h3>
        <ol style={s.stepList}>
          <li style={s.step}>
            <span style={s.stepNum}>1</span>
            <div>
              <strong>Isi Maklumat Asas</strong>
              <p style={s.stepDesc}>
                Lengkapkan maklumat pencerapan: Mata Pelajaran, Kelas, Tarikh Pencerapan, dan Nama Sekolah.
              </p>
            </div>
          </li>
          <li style={s.step}>
            <span style={s.stepNum}>2</span>
            <div>
              <strong>Nilaikan Setiap Item</strong>
              <p style={s.stepDesc}>
                Untuk setiap item penilaian (jumlah {totalItems} item), pilih skor 0 hingga 4
                menggunakan butang bernombor. Klik butang ▼ untuk melihat penerangan rubrik penskoran.
              </p>
            </div>
          </li>
          <li style={s.step}>
            <span style={s.stepNum}>3</span>
            <div>
              <strong>Simpan Draft</strong>
              <p style={s.stepDesc}>
                Klik "Simpan Draft" untuk menyimpan kemajuan anda. Anda boleh kembali dan meneruskan
                pengisian pada bila-bila masa.
              </p>
            </div>
          </li>
          <li style={s.step}>
            <span style={s.stepNum}>4</span>
            <div>
              <strong>Hantar Borang</strong>
              <p style={s.stepDesc}>
                Setelah semua {totalItems} item dinilai, klik "Hantar Borang". Selepas dihantar,
                borang tidak boleh diubah suai. Pastikan semua maklumat adalah tepat.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>Jenis Pencerapan</h3>
        <div style={s.typeGrid}>
          <div style={s.typeCard}>
            <div style={{ ...s.typeIcon, background: "#eff6ff", color: "#2563eb" }}>🔍</div>
            <strong>Pencerapan Kendiri</strong>
            <p style={s.typeDesc}>
              Penilaian kendiri oleh guru sendiri berdasarkan prestasi PdPc semasa. Digunakan untuk
              refleksi peribadi dan penambahbaikan diri.
            </p>
          </div>
          <div style={s.typeCard}>
            <div style={{ ...s.typeIcon, background: "#f0fdf4", color: "#16a34a" }}>📋</div>
            <strong>Pencerapan 1</strong>
            <p style={s.typeDesc}>
              Pencerapan formal pertama yang dijalankan oleh pentadbir/penilai. Dilakukan pada
              semester pertama atau awal tahun.
            </p>
          </div>
          <div style={s.typeCard}>
            <div style={{ ...s.typeIcon, background: "#fefce8", color: "#d97706" }}>📝</div>
            <strong>Pencerapan 2</strong>
            <p style={s.typeDesc}>
              Pencerapan formal kedua. Dijalankan selepas Pencerapan 1 sebagai penilaian susulan
              untuk melihat kemajuan guru.
            </p>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>Soalan Lazim (FAQ)</h3>
        <div style={s.faqList}>
          {[
            {
              q: "Bolehkah saya mengubah borang selepas dihantar?",
              a: "Tidak. Setelah borang dihantar, ia tidak boleh diubah suai. Sila semak dengan teliti sebelum menghantar.",
            },
            {
              q: "Apakah maksud skor yang dikira?",
              a: "Skor dikira secara berwajaran mengikut kepentingan setiap sub-aspek. Jumlah wajaran adalah 100%. Skor akhir menentukan Taraf PdP.",
            },
            {
              q: "Bolehkah saya menyimpan separuh jalan?",
              a: "Ya. Klik 'Simpan Draft' untuk menyimpan kemajuan. Anda boleh kembali dan meneruskan pada bila-bila masa.",
            },
            {
              q: "Bagaimana saya boleh melihat rubrik penskoran?",
              a: "Klik butang ▼ di sebelah kanan setiap item untuk memaparkan penerangan rubrik penskoran.",
            },
          ].map((faq, i) => (
            <div key={i} style={s.faqItem}>
              <div style={s.faqQ}>❓ {faq.q}</div>
              <div style={s.faqA}>→ {faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    maxWidth: 900,
    margin: "0 auto",
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1e3a5f",
    marginBottom: 20,
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
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: 8,
  },
  text: {
    margin: 0,
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.6,
  },
  aspekGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 12,
  },
  aspekCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 14,
  },
  aspekKod: {
    fontWeight: 700,
    fontSize: 14,
    color: "#3b82f6",
  },
  aspekTajuk: {
    fontWeight: 600,
    fontSize: 14,
    color: "#1e293b",
    marginTop: 4,
    marginBottom: 4,
  },
  aspekWajaran: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  aspekItems: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  subItem: {
    display: "flex",
    gap: 6,
    alignItems: "flex-start",
    fontSize: 12,
    color: "#374151",
  },
  subKod: {
    fontWeight: 700,
    color: "#64748b",
    flexShrink: 0,
  },
  subName: {
    flex: 1,
  },
  subWajaran: {
    color: "#3b82f6",
    fontWeight: 600,
    flexShrink: 0,
  },
  scoreTable: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "10px 14px",
    borderRadius: 8,
  },
  scoreNum: {
    fontWeight: 800,
    fontSize: 22,
    width: 32,
    textAlign: "center",
  },
  scoreLabel: {
    fontWeight: 700,
    fontSize: 14,
    width: 200,
  },
  scoreDesc: {
    fontSize: 13,
    color: "#374151",
  },
  tarafTable: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  tarafRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderRadius: 8,
  },
  tarafName: {
    fontWeight: 700,
    fontSize: 14,
  },
  tarafRange: {
    fontSize: 14,
    color: "#374151",
  },
  stepList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  step: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  stepNum: {
    background: "#1e3a5f",
    color: "#fff",
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  stepDesc: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 12,
  },
  typeCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 16,
    textAlign: "center",
  },
  typeIcon: {
    fontSize: 28,
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
  },
  typeDesc: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
    textAlign: "left",
  },
  faqList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  faqItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 14,
  },
  faqQ: {
    fontWeight: 600,
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 6,
  },
  faqA: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.5,
  },
};
