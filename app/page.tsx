"use client";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/lib/types";
import ConceptCard from "@/components/ConceptCard";
import QuizCard from "@/components/QuizCard";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [weakTopic, setWeakTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    fetch(`/api/feed${weakTopic ? `?weakTopic=${weakTopic}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        setCards(data);
        setLoading(false);
      });
  }, [weakTopic]);

  async function advance() {
    const card = cards[index];
    if (card) {
      await supabase
        .from("cards")
        .update({ times_seen: card.times_seen + 1 })
        .eq("id", card.id);
    }
    setIndex((i) => i + 1);
  }

  async function handleQuizResult(card: Card, correct: boolean) {
    await supabase
      .from("cards")
      .update({
        times_seen: card.times_seen + 1,
        times_correct: card.times_correct + (correct ? 1 : 0),
      })
      .eq("id", card.id);

    if (!correct) setWeakTopic(card.topic);
    setIndex((i) => i + 1);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientY;
    if (diff > 50) advance();
    touchStart.current = null;
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center h-full">
        <span style={{ color: "var(--muted)" }}>Loading your feed...</span>
      </main>
    );
  }

  const current = cards[index];

  if (!current) {
    return (
      <main className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
        <p className="text-2xl font-semibold">You&apos;re all caught up</p>
        <p style={{ color: "var(--muted)" }}>Come back tomorrow for more cards.</p>
      </main>
    );
  }

  return (
    <main
      className="flex flex-col h-full px-4 py-6 max-w-md mx-auto"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>
          BloomScroll
        </span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {index + 1} / {cards.length}
        </span>
      </div>

      <div className="flex-1 min-h-0">
        {current.type === "concept" ? (
          <ConceptCard card={current} />
        ) : (
          <QuizCard
            card={current}
            onResult={(ok) => handleQuizResult(current, ok)}
          />
        )}
      </div>

      {current.type === "concept" && (
        <button
          className="mt-4 w-full py-3 rounded-xl font-semibold text-sm"
          style={{ background: "var(--card-bg)", color: "var(--muted)" }}
          onClick={advance}
        >
          Next →
        </button>
      )}
    </main>
  );
}
