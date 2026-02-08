"use client";

import { useState, useEffect, useCallback, useRef, useLayoutEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  buildWordCloudData,
  WORD_CLOUD_COLORS,
  type WordCount,
} from "@/lib/wordCloud";

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 72;
const PADDING = 24;
const AUTO_REFRESH_MS = 20_000;

type CaptionRow = {
  content: string;
  created_at?: string;
  [key: string]: unknown;
};

type PlacedWord = {
  word: string;
  left: number;
  top: number;
  fontSize: number;
  color: string;
};

function ellipseContains(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean {
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}

function rectsOverlap(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean {
  return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
}

function getSpiralPoints(cx: number, cy: number, maxR: number, step = 6): [number, number][] {
  const points: [number, number][] = [];
  const maxPoints = 8000;
  for (let i = 0; i < maxPoints; i++) {
    const angle = i * 0.5;
    const r = step * Math.sqrt(i);
    if (r > maxR) break;
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return points;
}

export default function Home() {
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const fetchCaptions = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase.from("captions").select("content");
      if (fetchError) {
        setError(fetchError.message);
        setCaptions([]);
        return;
      }
      const list = (data ?? []) as CaptionRow[];
      setCaptions(list.map((r) => r.content ?? "").filter(Boolean));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch captions");
      setCaptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  useEffect(() => {
    const id = setInterval(fetchCaptions, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchCaptions]);

  const wordCloud = useMemo(() => buildWordCloudData(captions), [captions]);
  const maxCount = wordCloud[0]?.count ?? 1;

  useLayoutEffect(() => {
    if (wordCloud.length === 0 || !containerRef.current || !measureRef.current) {
      setPlacedWords([]);
      return;
    }

    const container = containerRef.current;
    const measure = measureRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    if (width <= 0 || height <= 0) {
      setPlacedWords([]);
      return;
    }

    const cx = width / 2;
    const cy = height / 2;
    const rx = Math.max(20, width / 2 - PADDING);
    const ry = Math.max(20, height / 2 - PADDING);

    const wordsWithSize: (WordCount & { fontSize: number; w: number; h: number })[] = [];
    measure.style.position = "absolute";
    measure.style.visibility = "hidden";
    measure.style.whiteSpace = "nowrap";
    measure.style.fontWeight = "600";
    measure.style.fontFamily = "system-ui, sans-serif";
    measure.style.pointerEvents = "none";
    measure.style.left = "-9999px";
    measure.style.top = "0";

    for (const { word, count } of wordCloud) {
      const ratio = maxCount > 0 ? count / maxCount : 0;
      const fontSize = Math.round(MIN_FONT_SIZE + ratio * (MAX_FONT_SIZE - MIN_FONT_SIZE));
      measure.textContent = word;
      measure.style.fontSize = `${fontSize}px`;
      const w = measure.offsetWidth;
      const h = measure.offsetHeight;
      wordsWithSize.push({ word, count, fontSize, w, h });
    }

    const placed: PlacedWord[] = [];
    const placedRects: { x: number; y: number; w: number; h: number }[] = [];
    const colorCount = WORD_CLOUD_COLORS.length;

    for (let i = 0; i < wordsWithSize.length; i++) {
      const { word, fontSize, w, h } = wordsWithSize[i];
      const color = WORD_CLOUD_COLORS[i % colorCount];
      let placedThis = false;

      const spiral = getSpiralPoints(cx, cy, Math.max(rx, ry));
      for (const [px, py] of spiral) {
        const left = px - w / 2;
        const top = py - h / 2;
        const centerX = px;
        const centerY = py;

        if (!ellipseContains(centerX, centerY, cx, cy, rx, ry)) continue;
        if (left < 0 || top < 0 || left + w > width || top + h > height) continue;

        const overlaps = placedRects.some((r) =>
          rectsOverlap(left, top, w, h, r.x, r.y, r.w, r.h)
        );
        if (overlaps) continue;

        placed.push({ word, left, top, fontSize, color });
        placedRects.push({ x: left, y: top, w, h });
        placedThis = true;
        break;
      }

      if (!placedThis) {
        placed.push({
          word,
          left: 0,
          top: 0,
          fontSize,
          color,
        });
        placedRects.push({ x: 0, y: 0, w: 0, h: 0 });
      }
    }

    setPlacedWords(placed);
  }, [wordCloud, maxCount]);

  if (loading && captions.length === 0) {
    return (
      <main style={styles.wrapper}>
        <p style={styles.message}>Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.wrapper}>
        <p style={styles.error}>{error}</p>
      </main>
    );
  }

  if (!loading && wordCloud.length === 0) {
    return (
      <main style={styles.wrapper}>
        <p style={styles.message}>No words to display.</p>
      </main>
    );
  }

  return (
    <main style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>Most common caption words</h1>
        <p style={styles.description}>
          This word cloud shows the most frequent words from all captions. Larger words appear more often; 
          the top 300 words are shown, excluding short words and common stopwords (e.g. &quot;the&quot;, &quot;and&quot;).
        </p>
      </header>
      <div ref={containerRef} style={styles.cloudContainer}>
        <span ref={measureRef} aria-hidden />
        {placedWords.map(({ word, left, top, fontSize, color }) => (
          <span
            key={word}
            style={{
              ...styles.word,
              left,
              top,
              fontSize,
              color,
            }}
          >
            {word}
          </span>
        ))}
      </div>
      <a href="/captions" style={styles.captionsButton}>See all captions</a>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem",
    backgroundColor: "#fff",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    textAlign: "center",
    maxWidth: "min(90vw, 900px)",
    marginBottom: "1.5rem",
  },
  title: {
    margin: "0 0 0.5rem",
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#111",
  },
  description: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#555",
    lineHeight: 1.5,
  },
  cloudContainer: {
    position: "relative",
    width: "min(90vw, 900px)",
    height: "min(70vh, 560px)",
    margin: "0 1rem",
  },
  word: {
    position: "absolute",
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  message: {
    color: "#666",
    margin: 0,
  },
  error: {
    color: "#c00",
    margin: 0,
  },
  captionsButton: {
    display: "inline-block",
    marginTop: "2rem",
    padding: "0.6rem 1.25rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#fff",
    backgroundColor: "#333",
    border: "none",
    borderRadius: "8px",
    textDecoration: "none",
    cursor: "pointer",
  },
};
