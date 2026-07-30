import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const KonteksAuth = createContext(null);

async function dapatkanPeranan(idPengguna) {
  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", idPengguna)
    .maybeSingle();

  return profil?.role ?? null;
}

export function AuthProvider({ children }) {
  const [pengguna, setPengguna] = useState(null);
  const [peranan, setPeranan] = useState(null);
  const [sedangMuatkan, setSedangMuatkan] = useState(true);

  useEffect(() => {
    let masihAktif = true;

    async function pulihSesi() {
      const { data } = await supabase.auth.getSession();
      const sesi = data.session;

      if (!masihAktif) return;

      if (sesi?.user) {
        setPengguna(sesi.user);
        setPeranan(await dapatkanPeranan(sesi.user.id));
      } else {
        setPengguna(null);
        setPeranan(null);
      }

      if (masihAktif) setSedangMuatkan(false);
    }

    pulihSesi();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_acara, sesi) => {
      if (!masihAktif) return;

      if (sesi?.user) {
        setPengguna(sesi.user);
        setPeranan(await dapatkanPeranan(sesi.user.id));
      } else {
        setPengguna(null);
        setPeranan(null);
      }

      setSedangMuatkan(false);
    });

    return () => {
      masihAktif = false;
      subscription.unsubscribe();
    };
  }, []);

  async function keluar() {
    await supabase.auth.signOut();
    setPengguna(null);
    setPeranan(null);
  }

  const nilai = useMemo(
    () => ({ pengguna, peranan, sedangMuatkan, keluar }),
    [pengguna, peranan, sedangMuatkan]
  );

  return <KonteksAuth.Provider value={nilai}>{children}</KonteksAuth.Provider>;
}

export function gunaAuth() {
  const konteks = useContext(KonteksAuth);

  if (!konteks) {
    throw new Error("gunaAuth mesti digunakan dalam AuthProvider");
  }

  return konteks;
}
