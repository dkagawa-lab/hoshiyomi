create table if not exists line_birth_registration_sessions (
  line_user_id text primary key,
  step text not null check (step in ('date', 'time', 'place', 'confirm')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists line_birth_registration_sessions_updated_idx
  on line_birth_registration_sessions(updated_at desc);

alter table line_birth_registration_sessions enable row level security;
