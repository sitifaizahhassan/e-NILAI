import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/**
 * Hook untuk mendapatkan peranan (role) pengguna semasa daripada profiles.role.
 * Mengembalikan: { role, userId, loading }
 * role boleh jadi: 'guru' | 'pentadbir' | 'admin' | null
 */
export function useUserRole() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchRole() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          if (mounted) { setRole(null); setUserId(null); setLoading(false); }
          return;
        }
        if (mounted) setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (mounted) {
          setRole(profile?.role || "guru");
          setLoading(false);
        }
      } catch {
        if (mounted) { setRole("guru"); setLoading(false); }
      }
    }
    fetchRole();
    return () => { mounted = false; };
  }, []);

  const isPentadbirOrAdmin = role === "pentadbir" || role === "admin";
  const isAdmin = role === "admin";

  return { role, userId, loading, isPentadbirOrAdmin, isAdmin };
}
