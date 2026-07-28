import React from "react";

export default function StatCard({ title, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `6px solid ${color}` }}>
      <p style={styles.cardTitle}>{title}</p>
      <h2 style={styles.cardValue}>{value}</h2>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: 14,
  },
  cardValue: {
    margin: "8px 0 0",
    fontSize: 28,
  },
};