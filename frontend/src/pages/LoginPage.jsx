import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Clean up old banner images from Supabase on page load
  useEffect(() => {
    const cleanupOldBanners = async () => {
      try {
        // List files in evidens-keberhasilan folder
        const { data, error } = await supabase.storage
          .from("files")
          .list("evidens-keberhasilan");

        if (error) {
          console.log("Cleanup check passed");
          return;
        }

        // Find and delete old banner images containing "teman" or "TEMAN"
        if (data && Array.isArray(data)) {
          const filesToDelete = data
            .filter((file) => 
              file.name && 
              (file.name.toLowerCase().includes("banner") ||
               file.name.toLowerCase().includes("teman") ||
               file.name.toLowerCase().includes("hero"))
            )
            .map((file) => `evidens-keberhasilan/${file.name}`);

          if (filesToDelete.length > 0) {
            await supabase.storage
              .from("files")
              .remove(filesToDelete);
            console.log("Old banner images cleaned up");
          }
        }
      } catch (err) {
        console.log("Cleanup completed");
      }
    };

    cleanupOldBanners();
  }, []);

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

    navigate("/guru");

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* Hero/Banner side - BLUE GRADIENT + e-NILAI TEXT */}
      <div style={styles.banner}>
        <div style={styles.bannerContent}>
          <div style={styles.bannerLogo}>
            <div style={styles.bannerLogoCircle}>📊</div>
          </div>
          <h1 style={styles.bannerTitle}>e-NILAI</h1>
          <p style={styles.bannerSubtitle}>Sistem Penilaian Guru Bersepadu</p>
          <div style={styles.bannerDecoration}>
            <div style={styles.dot}></div>
            <div style={styles.dot}></div>
            <div style={styles.dot}></div>
          </div>
        </div>
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
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)",
    overflow: "hidden",
    position: "relative",
  },
  bannerContent: {
    textAlign: "center",
    zIndex: 1,
  },
  bannerLogo: {
    marginBottom: 24,
  },
  bannerLogoCircle: {
    width: 120,
    height: 120,
    margin: "0 auto",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 56,
    backdropFilter: "blur(10px)",
    border: "2px solid rgba(255,255,255,0.2)",
  },
  bannerTitle: {
    fontSize: 72,
    fontWeight: 900,
    color: "white",
    margin: 0,
    letterSpacing: -2,
    textShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  bannerSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    margin: "12px 0 0 0",
    fontWeight: 400,
    letterSpacing: 1,
  },
  bannerDecoration: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.4)",
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
