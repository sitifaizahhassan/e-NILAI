import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getUserDisplayName } from "../lib/navigation";
import "../layouts/AdminLayout.css";

export default function DashboardShell({ title, subtitle, menus, requiredRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sessionState, setSessionState] = useState({ user: null, profile: null, error: "" });

  useEffect(() => {
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshSession() {
    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setSessionState({ user, profile: null, error: "Profil pengguna tidak dijumpai." });
        return;
      }

      if (requiredRole === "admin" && profile.role !== "admin") {
        navigate("/guru", { replace: true });
        return;
      }

      setSessionState({ user, profile, error: "" });
    } catch (error) {
      console.error(error);
      setSessionState({ user: null, profile: null, error: error.message || "Ralat semakan sesi." });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  const currentTitle = useMemo(() => {
    const currentMenu = menus.find((menu) => menu.to === location.pathname);
    return currentMenu?.label || title;
  }, [location.pathname, menus, title]);

  if (loading) {
    return <div className="dashboard-loading">Memuatkan papan pemuka...</div>;
  }

  if (sessionState.error && !sessionState.user) {
    return <div className="dashboard-loading">{sessionState.error}</div>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <h2>{title}</h2>
            <p className="brand-subtitle">e-NILAI</p>
          </div>
        </div>

        <div className="layout-user-card">
          <strong>{getUserDisplayName(sessionState.profile, sessionState.user)}</strong>
          <span>{sessionState.profile?.role === "admin" ? "Pentadbir" : "Guru"}</span>
          <small>{sessionState.user?.email}</small>
        </div>

        <nav className="menu">
          {menus.map((menu) => (
            <NavLink
              key={menu.to}
              to={menu.to}
              end={menu.end}
              className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}
            >
              {menu.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="layout-logout-btn" onClick={handleLogout}>
          Log Keluar
        </button>
      </aside>

      <main className="admin-main">
        <div className="layout-page-header">
          <div>
            <h1>{currentTitle}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        {sessionState.error && <div className="dashboard-inline-alert">{sessionState.error}</div>}

        <Outlet
          context={{
            user: sessionState.user,
            profile: sessionState.profile,
            refreshSession,
          }}
        />
      </main>
    </div>
  );
}
