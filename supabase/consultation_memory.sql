alter table users add column if not exists consultation_memory text;
alter table users add column if not exists consultation_memory_updated_at timestamptz;
