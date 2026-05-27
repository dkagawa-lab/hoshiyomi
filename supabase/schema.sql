create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  client_user_id text,
  line_user_id text unique,
  email text unique,
  name text,
  gender text,
  romantic_interest text,
  birth_date date,
  birth_time time,
  birth_city text,
  latitude numeric,
  longitude numeric,
  plan text not null default 'free' check (plan in ('free', 'standard', 'luxury')),
  is_member boolean not null default false,
  free_bonus_remaining integer not null default 0,
  add_on_credits integer not null default 0,
  referral_code text,
  referred_by_user_id uuid references users(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table users add column if not exists client_user_id text;
alter table users add column if not exists line_user_id text;
alter table users add column if not exists gender text;
alter table users add column if not exists romantic_interest text;
alter table users add column if not exists is_member boolean not null default false;
alter table users add column if not exists free_bonus_remaining integer not null default 0;
alter table users add column if not exists add_on_credits integer not null default 0;
alter table users add column if not exists referral_code text;
alter table users add column if not exists referred_by_user_id uuid references users(id);
alter table users add column if not exists stripe_customer_id text;
alter table users add column if not exists stripe_subscription_id text;
alter table users add column if not exists updated_at timestamptz not null default now();

create unique index if not exists users_client_user_id_idx
  on users(client_user_id)
  where client_user_id is not null;

create unique index if not exists users_line_user_id_idx
  on users(line_user_id)
  where line_user_id is not null;

create index if not exists users_stripe_customer_idx
  on users(stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists users_stripe_subscription_idx
  on users(stripe_subscription_id)
  where stripe_subscription_id is not null;

create unique index if not exists users_referral_code_idx
  on users(referral_code)
  where referral_code is not null;

create table if not exists referral_redemptions (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  referrer_user_id uuid not null references users(id) on delete cascade,
  referred_user_id uuid not null references users(id) on delete cascade,
  credits integer not null default 30,
  created_at timestamptz not null default now(),
  unique(referred_user_id)
);

create index if not exists referral_redemptions_referrer_idx
  on referral_redemptions(referrer_user_id, created_at desc);

create index if not exists referral_redemptions_code_idx
  on referral_redemptions(referral_code);

create table if not exists stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx
  on chat_messages(user_id, created_at desc);

create table if not exists non_billable_events (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  key_hash text not null,
  kind text not null,
  created_at timestamptz not null default now()
);

create index if not exists non_billable_events_key_created_idx
  on non_billable_events(scope, key_hash, created_at desc);

create index if not exists non_billable_events_created_idx
  on non_billable_events(created_at desc);

create table if not exists user_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  display_name text,
  display_area text,
  rating_rewarded_at timestamptz,
  comment_rewarded_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists user_reviews_public_idx
  on user_reviews(updated_at desc)
  where comment is not null;

create or replace view monthly_user_chat_counts as
select
  user_id,
  date_trunc('month', created_at) as month,
  count(*) filter (where role = 'user') as user_message_count
from chat_messages
group by user_id, date_trunc('month', created_at);

create table if not exists contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'other',
  name text not null,
  email text not null,
  plan text,
  message text not null,
  page_url text,
  user_agent text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists contact_inquiries_created_idx
  on contact_inquiries(created_at desc);

create index if not exists contact_inquiries_status_idx
  on contact_inquiries(status);
