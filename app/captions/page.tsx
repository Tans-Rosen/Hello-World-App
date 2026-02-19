"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [votingCaptionId, setVotingCaptionId] = useState<number | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [votesByCaption, setVotesByCaption] = useState<Record<number, 1 | -1>>({});

  const supabase = useMemo(() => createClient(), []);

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
  }, [supabase]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const handleVote = useCallback(
    async (captionId: number, voteValue: 1 | -1) => {
      setVoteError(null);
      setVotingCaptionId(captionId);
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setVoteError(sessionError.message);
          return;
        }
        if (!session?.user) {
          setVoteError("You must be signed in to vote.");
          return;
        }

        const userId = session.user.id;
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          setVoteError(profileError.message);
          return;
        }
        const profileId = profile?.id ?? userId;

        const { error: insertError } = await supabase.from("caption_votes").insert({
          caption_id: captionId,
          profile_id: profileId,
          vote_value: voteValue,
          created_datetime_utc: new Date().toISOString(),
        });

        if (insertError) {
          setVoteError(insertError.message);
        } else {
          setVotesByCaption((prev) => ({ ...prev, [captionId]: voteValue }));
        }
      } catch (e) {
        setVoteError(e instanceof Error ? e.message : "Failed to submit vote");
      } finally {
        setVotingCaptionId(null);
      }
    },
    [supabase]
  );

  return (
    <main style={styles.main}>
      <a href="/" style={styles.backButton}>Back to word cloud</a>
      <h1 style={styles.h1}>All captions</h1>

      {loading && <p style={styles.message}>Loading captions…</p>}
      {error && <p style={styles.error}>{error}</p>}
      {voteError && <p style={styles.error}>{voteError}</p>}
      {!loading && !error && rows.length === 0 && (
        <p style={styles.message}>No captions found.</p>
      )}
      {!error && rows.length > 0 && (
        <ul style={styles.list}>
          {rows.map((row, i) => {
            const voted = row.id != null && votesByCaption[row.id] != null;
            const voteValue = row.id != null ? votesByCaption[row.id] : null;
            const cardStyle: React.CSSProperties = voted
              ? { ...styles.card, ...styles.cardVoted }
              : styles.card;
            return (
              <li key={row.id ?? i} style={cardStyle}>
                <span style={styles.content}>{row.content}</span>
                {row.created_at && (
                  <span style={styles.meta}>
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                )}
                {row.id != null && (
                  <div style={styles.voteRow}>
                    <button
                      type="button"
                      style={
                        voteValue === 1
                          ? { ...styles.voteButton, ...styles.voteButtonUpvoted }
                          : styles.voteButton
                      }
                      onClick={() => handleVote(row.id!, 1)}
                      disabled={votingCaptionId === row.id || voted}
                      aria-label="Upvote"
                    >
                      ↑ Upvote
                    </button>
                    <button
                      type="button"
                      style={
                        voteValue === -1
                          ? { ...styles.voteButton, ...styles.voteButtonDownvoted }
                          : styles.voteButton
                      }
                      onClick={() => handleVote(row.id!, -1)}
                      disabled={votingCaptionId === row.id || voted}
                      aria-label="Downvote"
                    >
                      ↓ Downvote
                    </button>
                  </div>
                )}
              </li>
            );
          })}
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
  cardVoted: {
    backgroundColor: "#e0e0e0",
    opacity: 0.85,
    borderColor: "#ddd",
  },
  content: {
    fontSize: "1rem",
    lineHeight: 1.4,
  },
  meta: {
    fontSize: "0.8rem",
    color: "#666",
  },
  voteRow: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  voteButton: {
    padding: "0.35rem 0.65rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#333",
    backgroundColor: "#e8e8e8",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
  },
  voteButtonUpvoted: {
    backgroundColor: "#2d8a3e",
    color: "#fff",
    borderColor: "#247a32",
  },
  voteButtonDownvoted: {
    backgroundColor: "#c23030",
    color: "#fff",
    borderColor: "#a02828",
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
