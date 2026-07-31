import React from "react";
import { GUIDE_PDF_PATH } from "../lib/navigation";

export default function GuidePage() {
  return (
    <div className="panel">
      <h2>Panduan Pengguna</h2>
      <p className="sub">
        Muat turun panduan rasmi e-NILAI dalam format PDF untuk rujukan pengisian profil,
        keberhasilan dan pencerapan.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <a className="refresh-btn" href={GUIDE_PDF_PATH} download>
          Muat Turun PDF
        </a>
        <a className="refresh-btn" href={GUIDE_PDF_PATH} target="_blank" rel="noreferrer">
          Buka Dalam Tab Baharu
        </a>
      </div>
    </div>
  );
}
