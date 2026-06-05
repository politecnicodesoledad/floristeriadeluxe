-- ============================================================
-- Floristería Deluxe — Esquema Supabase v2 (Auth + Roles + Cupones)
-- Pega TODO esto en: Supabase Dashboard → SQL Editor → Run
-- Es idempotente: puedes correrlo varias veces sin romper nada.
-- ============================================================

-- ---------- 1. ENUM de roles ----------
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

-- ---------- 2. PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  accepted_terms_at timestamptz,
  created_at timestamptz default now()
);

-- ---------- 3. USER ROLES ----------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

-- ---------- 4. has_role (security definer, evita recursión RLS) ----------
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ---------- 5. TRIGGER: crear profile al registrarse ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, accepted_terms_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 6. PRODUCTS ----------
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

-- ---------- 7. ADDRESSES (direcciones de envío del usuario) ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text default 'Casa',
  recipient text not null,
  phone text,
  address text not null,
  city text default 'Barranquilla',
  notes text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ---------- 8. COUPONS ----------
create table if not exists public.coupons (
  code text primary key,
  discount_percent integer not null check (discount_percent between 1 and 100),
  active boolean default true,
  expires_at timestamptz,
  max_uses integer,
  uses integer default 0,
  created_at timestamptz default now()
);

-- RPC para validar y devolver el cupón (público — solo lectura segura)
create or replace function public.apply_coupon(_code text)
returns table(code text, discount_percent integer)
language sql
stable
security definer
set search_path = public
as $$
  select c.code, c.discount_percent
  from public.coupons c
  where upper(c.code) = upper(_code)
    and c.active = true
    and (c.expires_at is null or c.expires_at > now())
    and (c.max_uses is null or c.uses < c.max_uses)
$$;

-- ---------- 9. ORDERS ----------
create table if not exists public.orders (
  code text primary key,
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null,
  total integer not null,
  subtotal integer,
  discount integer default 0,
  coupon_code text,
  dedicatoria text,
  customer jsonb,
  shipping_address jsonb,
  payment_method text default 'whatsapp',  -- 'whatsapp' | 'bold'
  payment_status text default 'pending',   -- 'pending' | 'paid' | 'failed'
  status text not null default 'Recibido', -- pipeline operativo
  bold_order_id text,
  created_at timestamptz default now()
);

-- columnas nuevas en orders si la tabla ya existía (v1):
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists subtotal integer;
alter table public.orders add column if not exists discount integer default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists shipping_address jsonb;
alter table public.orders add column if not exists payment_method text default 'whatsapp';
alter table public.orders add column if not exists payment_status text default 'pending';
alter table public.orders add column if not exists bold_order_id text;

-- ---------- 10. SITE_SETTINGS ----------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.user_roles    enable row level security;
alter table public.products      enable row level security;
alter table public.addresses     enable row level security;
alter table public.coupons       enable row level security;
alter table public.orders        enable row level security;
alter table public.site_settings enable row level security;

-- ---- profiles
drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_self_insert" on public.profiles;
drop policy if exists "profiles_admin_read"  on public.profiles;
create policy "profiles_self_read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_admin_read"  on public.profiles for select using (public.has_role(auth.uid(), 'admin'));

-- ---- user_roles (solo lectura propia + admin gestiona)
drop policy if exists "roles_self_read"  on public.user_roles;
drop policy if exists "roles_admin_all"  on public.user_roles;
create policy "roles_self_read" on public.user_roles for select using (auth.uid() = user_id);
create policy "roles_admin_all" on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---- products: lectura pública, escritura SOLO admin
drop policy if exists "products_read"        on public.products;
drop policy if exists "products_admin_write" on public.products;
create policy "products_read"        on public.products for select using (true);
create policy "products_admin_write" on public.products for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---- addresses: el usuario solo ve y maneja las suyas
drop policy if exists "addresses_self" on public.addresses;
create policy "addresses_self" on public.addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- coupons: solo admin lee/escribe directamente. El público los aplica vía RPC apply_coupon
drop policy if exists "coupons_admin" on public.coupons;
create policy "coupons_admin" on public.coupons for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---- orders:
--   - cualquiera puede crear pedidos (huésped o usuario)
--   - el usuario ve sus pedidos (user_id = auth.uid())
--   - el código de seguimiento permite lectura pública por código (para tracking sin login)
--   - admin ve y actualiza todo
drop policy if exists "orders_insert_any"   on public.orders;
drop policy if exists "orders_self_read"    on public.orders;
drop policy if exists "orders_public_track" on public.orders;
drop policy if exists "orders_admin_all"    on public.orders;
create policy "orders_insert_any"   on public.orders for insert with check (true);
create policy "orders_self_read"    on public.orders for select using (auth.uid() = user_id);
create policy "orders_public_track" on public.orders for select using (true);  -- tracking por código (cliente provee el código)
create policy "orders_admin_all"    on public.orders for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---- site_settings: lectura pública, escritura admin
drop policy if exists "settings_read"  on public.site_settings;
drop policy if exists "settings_admin" on public.site_settings;
create policy "settings_read"  on public.site_settings for select using (true);
create policy "settings_admin" on public.site_settings for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- GRANTS (Data API)
-- ============================================================
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;

grant select, insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;

grant select, insert on public.orders to anon;
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;

grant execute on function public.apply_coupon(text) to anon, authenticated;
grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated;

-- ============================================================
-- SEED: productos iniciales
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

-- Cupón de ejemplo
insert into public.coupons (code, discount_percent, active)
values ('DELUXE10', 10, true)
on conflict (code) do nothing;

-- ============================================================
-- CREAR USUARIO ADMIN (paso manual — hazlo DESPUÉS de correr el SQL)
-- ============================================================
-- 1) Ve a Supabase Dashboard → Authentication → Users → Add user → "Create new user"
--    Email:    angieflorez2008@hotmail.com
--    Password: angiedeluxe2021
--    ✔ Auto Confirm User
--
-- 2) Copia el UUID del usuario recién creado y corre en SQL Editor:
--
--    insert into public.user_roles (user_id, role)
--    values ('PEGA-AQUI-EL-UUID', 'admin')
--    on conflict (user_id, role) do nothing;
--
-- 3) Listo. Ese usuario ahora podrá entrar a la ruta secreta /control
--
-- ============================================================
-- (Opcional) Desactivar confirmación de email durante pruebas:
-- Authentication → Providers → Email → desactiva "Confirm email"
-- ============================================================