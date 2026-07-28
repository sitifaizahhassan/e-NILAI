import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div style={styles.wrap}>
      <form style={styles.card} onSubmit={handleLogin}>
        <h2 style={{ marginTop: 0 }}>Login e-Nilai</h2>

        <label>Email</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Kata Laluan</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>

        {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
  },
  card: {
    width: 380,
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
    display: "grid",
    gap: 8,
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 8,
  },
  btn: {
    marginTop: 8,
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#1d4ed8",
    color: "white",
    cursor: "pointer",
  },
};