-- ============================================================
-- Floristería Deluxe — Esquema Supabase
-- Pega TODO esto en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Productos
create table if not exists public.products (
  id text primary key,
  title text not null,
  description text default '',
  price integer not null,
  original_price integer,
  image text not null,
  category text not null,
  featured boolean default false,
  created_at timestamptz default now()
);

-- Pedidos (creados desde el flujo de WhatsApp)
create table if not exists public.orders (
  code text primary key,
  items jsonb not null,
  total integer not null,
  dedicatoria text,
  customer jsonb,
  status text not null default 'Recibido',
  created_at timestamptz default now()
);

-- Configuración del sitio (banner del home, popup promocional)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.products       enable row level security;
alter table public.orders         enable row level security;
alter table public.site_settings  enable row level security;

-- PRODUCTS: lectura pública, escritura pública (admin local con password)
--   ⚠️ Como el panel admin usa contraseña local, no Supabase Auth,
--   damos permisos amplios al rol anon. Si en el futuro migras a
--   Supabase Auth, reemplaza estas policies por (auth.role() = 'authenticated').
drop policy if exists "products_read"  on public.products;
drop policy if exists "products_write" on public.products;
create policy "products_read"  on public.products for select  using (true);
create policy "products_write" on public.products for all     using (true) with check (true);

-- ORDERS: lectura pública (para tracking por código), inserción pública,
--   actualización pública (admin cambia estado).
drop policy if exists "orders_read"   on public.orders;
drop policy if exists "orders_insert" on public.orders;
drop policy if exists "orders_update" on public.orders;
create policy "orders_read"   on public.orders for select using (true);
create policy "orders_insert" on public.orders for insert with check (true);
create policy "orders_update" on public.orders for update using (true) with check (true);

-- SITE_SETTINGS: lectura pública, escritura pública.
drop policy if exists "settings_read"  on public.site_settings;
drop policy if exists "settings_write" on public.site_settings;
create policy "settings_read"  on public.site_settings for select using (true);
create policy "settings_write" on public.site_settings for all    using (true) with check (true);

-- ============================================================
-- GRANTs explícitos (necesarios para el Data API de PostgREST)
-- ============================================================
grant select, insert, update, delete on public.products      to anon, authenticated;
grant select, insert, update         on public.orders        to anon, authenticated;
grant select, insert, update, delete on public.site_settings to anon, authenticated;

grant all on public.products      to service_role;
grant all on public.orders        to service_role;
grant all on public.site_settings to service_role;

-- ============================================================
-- Seed: productos iniciales (opcional, puedes borrarlos)
-- ============================================================
insert into public.products (id, title, description, price, original_price, image, category, featured) values
 ('p1','Ramo Rosas Eternas','24 rosas rojas premium con follaje fino y empaque artesanal en papel kraft con cinta de seda.',189000,220000,'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80','Cumpleaños',true),
 ('p2','Bouquet Primavera','Mezcla de tulipanes amarillos, lisianthus y gypsophila en empaque romántico.',145000,null,'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80','Cumpleaños',true),
 ('p3','Arreglo Boda Catedral','Arreglo nupcial con rosas blancas, hortensias y eucalipto plateado.',320000,null,'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80','Bodas',true),
 ('p4','Corona Fúnebre Serenidad','Corona de rosas y crisantemos blancos con cinta personalizada.',280000,null,'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80','Fúnebre',false),
 ('p5','Desayuno Sorpresa Deluxe','Canasta con frutas, jugo natural, croissants, chocolates y mini ramo de flores.',175000,199000,'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&q=80','Desayunos',true),
 ('p6','Caja Corazón Romántica','Caja en forma de corazón con rosas rojas preservadas y chocolates finos.',210000,null,'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80','Cumpleaños',true),
 ('p7','Ramo Girasoles Sol','12 girasoles frescos con follaje verde y empaque kraft elegante.',135000,null,'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80','Cumpleaños',false),
 ('p8','Centro de Mesa Boda','Centro de mesa con rosas pastel, peonías y velas para recepción nupcial.',240000,null,'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80','Bodas',false)
on conflict (id) do nothing;