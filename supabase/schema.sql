create table cards (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('concept', 'quiz')),
  topic text not null,
  content text not null,
  source_url text,
  linked_card_id uuid references cards(id),
  answer text,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  times_seen integer not null default 0,
  times_correct integer not null default 0,
  created_at timestamptz not null default now()
);

-- Index for topic-based queries (used by adaptive feed)
create index cards_topic_idx on cards(topic);
create index cards_type_idx on cards(type);
