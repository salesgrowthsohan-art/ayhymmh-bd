-- Product catalog data is served through the app's server API using the service role key.
-- RLS is enabled with no anon/authenticated policies: browser clients cannot write the catalog.
create table if not exists public.store_products (
  id text primary key,
  sku text not null unique,
  position integer not null default 0,
  product jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists store_products_position_idx on public.store_products (position, id);
alter table public.store_products enable row level security;

create or replace function public.touch_store_product_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists store_products_touch_updated_at on public.store_products;
create trigger store_products_touch_updated_at
before update on public.store_products
for each row execute function public.touch_store_product_updated_at();

-- Public operational settings (WhatsApp, delivery fees, categories) are exposed
-- through the application API; the browser and agents never receive adminPassword.
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.store_settings enable row level security;

-- Public read URLs are needed for customer-facing product cards; writes use short-lived
-- signed upload URLs issued only after server-side admin/agent bearer-token validation.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  104857600,
  array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
