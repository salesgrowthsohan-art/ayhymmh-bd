-- Server-side admin credential hash. RLS is enabled and no client policies are granted.
create table if not exists public.store_admin_auth (
  id smallint primary key default 1 check (id = 1),
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.store_admin_auth enable row level security;
revoke all on table public.store_admin_auth from public, anon, authenticated;
