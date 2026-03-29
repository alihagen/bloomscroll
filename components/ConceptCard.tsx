"use client";
import { Card } from "@/lib/types";

const topicColors: Record<string, string> = {
  evals: "#a3e635",
  RAG: "#38bdf8",
  agents: "#f472b6",
  "prompt-injection": "#fb923c",
  "model-routing": "#c084fc",
  "fine-tuning": "#34d399",
  "LLM-as-judge": "#fbbf24",
  "agent-harness": "#f87171",
  "vibe-coding": "#818cf8",
  "AI-strategy": "#2dd4bf",
};

export default function ConceptCard({ card }: { card: Card }) {
  const color = topicColors[card.topic] || "#a3e635";

  return (
    <div
      className="flex flex-col justify-between h-full rounded-2xl p-6"
      style={{ background: "var(--card-bg)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: `${color}22`, color }}
        >
          {card.topic}
        </span>
        <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>
          {card.difficulty}
        </span>
      </div>

      <p className="text-xl font-medium leading-relaxed" style={{ color: "var(--text)" }}>
        {card.content}
      </p>

      <div className="flex items-center justify-between">
        {card.source_url ? (
          <a
            href={card.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline"
            style={{ color: "var(--muted)" }}
          >
            Source
          </a>
        ) : (
          <span />
        )}
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          swipe to continue →
        </span>
      </div>
    </div>
  );
}
