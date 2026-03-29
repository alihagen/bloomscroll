import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const weakTopic = searchParams.get("weakTopic");

  let query = supabase
    .from("cards")
    .select("*")
    .order("times_seen", { ascending: true })
    .limit(20);

  // Boost weak topics by fetching more of them
  if (weakTopic) {
    const { data: topicCards } = await supabase
      .from("cards")
      .select("*")
      .eq("topic", weakTopic)
      .order("times_seen", { ascending: true })
      .limit(8);

    const { data: otherCards } = await query.neq("topic", weakTopic).limit(12);

    const combined = [...(topicCards || []), ...(otherCards || [])].sort(
      () => Math.random() - 0.5
    );
    return Response.json(combined);
  }

  const { data } = await query;
  return Response.json(data || []);
}
