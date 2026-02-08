"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

type CaptionRow = {
  id?: number;
  content: string;
  created_at?: string;
  [key: string]: unknown;
};

export default function CaptionsPage() {
  const [rows, setRows] = useState<CaptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaptions = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("captions")
        .select("*");

      if (fetchError) {
        setError(fetchError.message);
        setRows([]);
        return;
      }

      const list = (data ?? []) as CaptionRow[];
      const hasCreatedAt = list.length > 0 && list.some((r) => r.created_at != null);
      if (hasCreatedAt) {
        list.sort((a, b) => {
          const tA = a.created_at ?? "";
          const tB = b.created_at ?? "";
          return tB.localeCompare(tA);
        });
      }
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch captions");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  return (
    <main style={styles.main}>
      <a href="/" style={styles.backButton}>Back to word cloud</a>
      <h1 style={styles.h1}>All captions</h1>

      {loading && <p style={styles.message}>Loading captions…</p>}
      {error && <p style={styles.error}>{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p style={styles.message}>No captions found.</p>
      )}
      {!error && rows.length > 0 && (
        <ul style={styles.list}>
          {rows.map((row, i) => (
            <li key={row.id ?? i} style={styles.card}>
              <span style={styles.content}>{row.content}</span>
              {row.created_at && (
                <span style={styles.meta}>
                  {new Date(row.created_at).toLocaleString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <p style={styles.nav}>
        <a href="/" style={styles.link}>← Back to word cloud</a>
      </p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    padding: "2rem",
    maxWidth: 700,
    margin: "0 auto",
    fontFamily: "system-ui, sans-serif",
  },
  backButton: {
    display: "inline-block",
    marginBottom: "1rem",
    padding: "0.5rem 1rem",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#fff",
    backgroundColor: "#333",
    borderRadius: "6px",
    textDecoration: "none",
  },
  h1: {
    margin: "0 0 1.5rem",
    fontSize: "1.75rem",
  },
  message: {
    color: "#666",
    margin: 0,
  },
  error: {
    color: "#c00",
    margin: 0,
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  card: {
    padding: "1rem 1.25rem",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    border: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  content: {
    fontSize: "1rem",
    lineHeight: 1.4,
  },
  meta: {
    fontSize: "0.8rem",
    color: "#666",
  },
  nav: {
    marginTop: "2rem",
    fontSize: "0.95rem",
  },
  link: {
    color: "#0066cc",
    textDecoration: "none",
  },
};
