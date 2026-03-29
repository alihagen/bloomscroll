import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { Card } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a learning content generator for BloomScroll, a bite-sized AI learning app for product managers who are smart but new to AI/ML.

Your cards should feel like the best tweet you've ever read about a topic — not a textbook. Each card should make the reader think "oh wow, I never thought about it that way."

For each concept, pick the BEST angle from these three approaches:
- Analogy-first: lead with a vivid analogy that makes the concept click instantly
- Surprising reframe: open with the counterintuitive or non-obvious thing most people get wrong
- PM relevance: make the "why this matters for YOUR job" the most exciting part

Output format:
{
  "cards": [
    {
      "type": "concept",
      "topic": "evals",
      "content": "The card text — max 55 words, punchy, one idea only. No jargon without a quick in-line explanation.",
      "difficulty": "easy|medium|hard",
      "source_url": "url if available"
    },
    {
      "type": "quiz",
      "topic": "evals",
      "content": "A question that makes you think, not just recall. Phrase it like a real interview question.",
      "answer": "Concise answer (1-2 sentences). Explain the 'why', not just the 'what'.",
      "difficulty": "easy|medium|hard",
      "linked_concept_content": "exact content field of the concept card this tests"
    }
  ]
}

Rules:
- Each concept card covers ONE idea only, max 55 words
- Quiz cards are optional — only add one if the concept is genuinely testable and interesting
- Difficulty: easy = recall/analogy, medium = apply to a real scenario, hard = tradeoff or edge case
- Never start a card with "In AI..." or "This is..." — hook immediately`;

export async function POST(req: Request) {
  const { sourceText, sourceUrl } = await req.json();

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate learning cards from this source material:\n\n${sourceText}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "Failed to parse cards from Claude response" }, { status: 500 });
  }

  const { cards: rawCards } = JSON.parse(jsonMatch[0]);

  // Insert concept cards first, then quiz cards with linked_card_id
  const conceptCards: Card[] = [];
  for (const card of rawCards) {
    if (card.type === "concept") {
      const { data, error } = await supabase
        .from("cards")
        .insert({
          type: card.type,
          topic: card.topic,
          content: card.content,
          source_url: sourceUrl || card.source_url || null,
          difficulty: card.difficulty,
          times_seen: 0,
          times_correct: 0,
        })
        .select()
        .single();
      if (!error && data) conceptCards.push(data);
    }
  }

  for (const card of rawCards) {
    if (card.type === "quiz") {
      // Find the concept card this quiz is linked to
      const linked = conceptCards.find(
        (c) => c.content === card.linked_concept_content
      );
      await supabase.from("cards").insert({
        type: card.type,
        topic: card.topic,
        content: card.content,
        answer: card.answer,
        linked_card_id: linked?.id || null,
        difficulty: card.difficulty,
        times_seen: 0,
        times_correct: 0,
      });
    }
  }

  return Response.json({ inserted: rawCards.length });
}
