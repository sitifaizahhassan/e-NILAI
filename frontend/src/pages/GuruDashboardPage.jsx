import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getUserDisplayName, getWorkflowLabel } from "../lib/navigation";

export default function GuruDashboardPage() {
  const { user, profile } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState({
    keberhasilan: "Belum wujud",
    kendiri: "Belum wujud",
    pertama: "Belum wujud",
    kedua: "Belum wujud",
  });

  useEffect(() => {
    if (user?.id) {
      loadStatuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function loadStatuses() {
    setLoading(true);
    try {
      const [keberhasilan, kendiri, pertama, kedua] = await Promise.all([
        supabase.from("keberhasilan_forms").select("status").eq("guru_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("pencerapan_kendiri").select("status").eq("user_id", user.id).maybeSingle(),
        supabase.from("pencerapan_1").select("status").eq("user_id", user.id).maybeSingle(),
        supabase.from("pencerapan_2").select("status").eq("user_id", user.id).maybeSingle(),
      ]);

      for (const result of [keberhasilan, kendiri, pertama, kedua]) {
        if (result.error) throw result.error;
      }

      setStatusMap({
        keberhasilan: keberhasilan.data?.status ? getWorkflowLabel(keberhasilan.data.status) : "Belum wujud",
        kendiri: kendiri.data?.status ? getWorkflowLabel(kendiri.data.status) : "Belum wujud",
        pertama: pertama.data?.status ? getWorkflowLabel(pertama.data.status) : "Belum wujud",
        kedua: kedua.data?.status ? getWorkflowLabel(kedua.data.status) : "Belum wujud",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    { title: "Profil Guru", to: "profil", status: profile?.no_kp ? "Dikemaskini" : "Perlu dilengkapkan" },
    { title: "Borang Keberhasilan", to: "keberhasilan", status: statusMap.keberhasilan },
    { title: "Pencerapan Kendiri", to: "pencerapan-kendiri", status: statusMap.kendiri },
    { title: "Pencerapan 1", to: "pencerapan-1", status: statusMap.pertama },
    { title: "Pencerapan Kedua", to: "pencerapan-2", status: statusMap.kedua },
    { title: "Panduan", to: "panduan", status: "PDF tersedia" },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="panel">
        <h2>Selamat datang, {getUserDisplayName(profile, user)}</h2>
        <p className="sub">
          Lengkapkan semua modul penilaian anda melalui menu di sebelah kiri. {loading ? "Memuatkan status semasa..." : ""}
        </p>
      </section>

      <section className="cards-grid">
        {cards.map((card, index) => (
          <Link
            key={card.to}
            to={card.to}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="stat-card" style={{ "--accent": ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"][index] }}>
              <p>{card.title}</p>
              <h3 style={{ fontSize: 20, lineHeight: 1.3 }}>{card.status}</h3>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
