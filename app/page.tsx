"use client";

import { useState } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2rem",
    backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
    color: isDark ? "#e5e5e5" : "#111",
    transition: "background-color 0.2s, color 0.2s",
  };

  const headingStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "3rem",
    fontWeight: 700,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: isDark ? "#333" : "#ddd",
    color: isDark ? "#e5e5e5" : "#111",
    border: isDark ? "1px solid #555" : "1px solid #ccc",
    borderRadius: "8px",
  };

  return (
    <main style={containerStyle}>
      <h1 style={headingStyle}>Hello World</h1>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => setIsDark(!isDark)}
      >
        {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      </button>
    </main>
  );
}
