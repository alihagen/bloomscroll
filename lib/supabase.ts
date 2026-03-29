import { createClient } from "@supabase/supabase-js";

// Falls back to placeholders at build time; real values used at runtime
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);
