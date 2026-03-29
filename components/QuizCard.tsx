"use client";
import { useState } from "react";
import { Card } from "@/lib/types";

export default function QuizCard({
  card,
  onResult,
}: {
  card: Card;
  onResult: (correct: boolean) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="flex flex-col justify-between h-full rounded-2xl p-6"
      style={{ background: "#1e1a2e" }}
    >
      <span
        className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full w-fit"
        style={{ background: "#a78bfa22", color: "#a78bfa" }}
      >
        quiz · {card.topic}
      </span>

      <p className="text-xl font-medium leading-relaxed">{card.content}</p>

      {!revealed ? (
        <button
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{ background: "#a78bfa", color: "#0f0f0f" }}
          onClick={() => setRevealed(true)}
        >
          Show Answer
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: "#ffffff11", color: "var(--text)" }}
          >
            {card.answer}
          </div>
          <div className="flex gap-3">
            <button
              className="flex-1 py-3 rounded-xl font-semibold text-sm"
              style={{ background: "#4ade8033", color: "#4ade80" }}
              onClick={() => onResult(true)}
            >
              Got it
            </button>
            <button
              className="flex-1 py-3 rounded-xl font-semibold text-sm"
              style={{ background: "#f8717133", color: "#f87171" }}
              onClick={() => onResult(false)}
            >
              Not yet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
