-- Failed admin-login counters are server-only and scoped by a hashed client IP.
create table if not exists public.store_admin_login_attempts (
  ip_hash text primary key,
  failed_count integer not null default 0 check (failed_count >= 0),
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.store_admin_login_attempts enable row level security;
revoke all on table public.store_admin_login_attempts from public, anon, authenticated;
