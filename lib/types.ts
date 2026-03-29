export type CardType = "concept" | "quiz";

export type Topic =
  | "evals"
  | "RAG"
  | "agents"
  | "prompt-injection"
  | "model-routing"
  | "fine-tuning"
  | "LLM-as-judge"
  | "agent-harness"
  | "vibe-coding"
  | "AI-strategy";

export interface Card {
  id: string;
  type: CardType;
  topic: Topic | string;
  content: string;        // explanation for concept cards; question for quiz cards
  source_url?: string;    // concept cards only
  linked_card_id?: string; // quiz cards only
  answer?: string;        // quiz cards only
  difficulty: "easy" | "medium" | "hard";
  times_seen: number;
  times_correct: number;
  created_at: string;
}
