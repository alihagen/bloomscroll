import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { Card } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a learning content generator for BloomScroll, a bite-sized AI learning app for product managers.

Given source material, generate learning cards in this JSON format:
{
  "cards": [
    {
      "type": "concept",
      "topic": "evals",
      "content": "2-3 sentence plain-English explanation of one concept. Use an analogy if possible.",
      "difficulty": "easy|medium|hard",
      "source_url": "url if available"
    },
    {
      "type": "quiz",
      "topic": "evals",
      "content": "A question testing the concept above",
      "answer": "Concise correct answer",
      "difficulty": "easy|medium|hard",
      "linked_concept_content": "exact content of the concept card this tests"
    }
  ]
}

Rules:
- Each concept card should explain ONE idea only
- Keep concept content under 60 words
- Quiz cards are optional — only generate one if the concept is genuinely testable
- Difficulty: easy = definition, medium = application, hard = edge case or tradeoff
- Write for a senior PM who is new to AI/ML — no jargon without explanation`;

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
