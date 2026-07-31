import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Kata laluan tidak sepadan. Sila semak semula.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata laluan mestilah sekurang-kurangnya 6 aksara.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setSuccessMsg(
      "Akaun berjaya didaftarkan! Sila semak e-mel anda untuk pengesahan, kemudian log masuk."
    );
    setLoading(false);

    setTimeout(() => navigate("/login"), 3000);
  };

  return (
    <div style={styles.wrap}>
      <form style={styles.card} onSubmit={handleSignUp}>
        <h2 style={{ marginTop: 0 }}>Daftar Akaun e-NILAI</h2>

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

        <label>Sahkan Kata Laluan</label>
        <input
          style={styles.input}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? "Mendaftar..." : "Daftar"}
        </button>

        {errorMsg && <p style={{ color: "crimson", margin: 0 }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "green", margin: 0 }}>{successMsg}</p>}

        <p style={{ margin: 0, textAlign: "center" }}>
          Sudah ada akaun?{" "}
          <Link to="/login" style={{ color: "#1d4ed8" }}>
            Log Masuk
          </Link>
        </p>
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
