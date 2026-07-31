import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (pErr || !profile) {
      setErrorMsg("Profil pengguna tidak dijumpai. Sila hubungi admin.");
      setLoading(false);
      return;
    }

    if (profile.role === "admin") navigate("/admin");
    else navigate("/guru");

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* Hero/Banner side */}
      <div style={styles.banner}>
        <img
          src="/assets/banner.svg"
          alt="e-NILAI – Sistem Penilaian Guru Bersepadu"
          style={styles.bannerImg}
        />
      </div>

      {/* Login form side */}
      <div style={styles.formSide}>
        <form style={styles.card} onSubmit={handleLogin}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>e</div>
            <span style={styles.logoText}>e-NILAI</span>
          </div>
          <h2 style={styles.title}>Log Masuk</h2>
          <p style={styles.subtitle}>Sistem Penilaian Guru Bersepadu</p>

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contoh@sekolah.edu.my"
            required
          />

          <label style={styles.label}>Kata Laluan</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Log Masuk"}
          </button>

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}

          <p style={{ margin: 0, textAlign: "center", fontSize: 14 }}>
            Belum ada akaun?{" "}
            <Link to="/signup" style={{ color: "#1d4ed8" }}>
              Daftar di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#f3f4f6",
  },
  banner: {
    flex: 1,
    display: "flex",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)",
    overflow: "hidden",
  },
  bannerImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  formSide: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    background: "#f3f4f6",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 10px 40px rgba(0,0,0,0.10)",
    display: "grid",
    gap: 10,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 18,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1e3a8a",
    letterSpacing: 1,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 2,
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    marginBottom: 4,
    outline: "none",
    transition: "border-color 0.2s",
  },
  btn: {
    marginTop: 8,
    border: "none",
    borderRadius: 8,
    padding: "12px 14px",
    background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
    color: "white",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  error: {
    color: "crimson",
    fontSize: 13,
    margin: 0,
  },
};