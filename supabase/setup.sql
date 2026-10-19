-- سُقيا: قاعدة بيانات السواقين — انسخ الملف كامل والصقه في SQL Editor واضغط Run
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.drivers (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 60),
  phone       text not null unique check (phone ~ '^[0-9]{10,15}$'),
  areas       text[] not null check (cardinality(areas) between 1 and 80),
  types       text[] not null check (cardinality(types) between 1 and 2),
  prices      jsonb  not null,
  note        text check (char_length(note) <= 140),
  available   boolean not null default true,
  status      text not null default 'pending' check (status in ('pending','approved','blocked')),
  code_hash   text not null
);
create table if not exists public.app_admin (
  id int primary key default 1 check (id = 1),
  pass_hash text not null
);
alter table public.drivers   enable row level security;
alter table public.app_admin enable row level security;
revoke all on public.drivers, public.app_admin from anon, authenticated;

-- helpers --------------------------------------------------------------
create or replace function public._clean_prices(p jsonb) returns jsonb
language sql immutable set search_path = public as $$
  select coalesce(jsonb_object_agg(k, round((v #>> '{}')::numeric, 3)), '{}'::jsonb)
  from jsonb_each(coalesce(p, '{}'::jsonb)) as e(k, v)
  where k in ('1000','2000','3000','5000')
    and jsonb_typeof(v) = 'number' and (v #>> '{}')::numeric > 0 and (v #>> '{}')::numeric < 1000
$$;

create or replace function public._check_admin(p_pass text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not exists (select 1 from app_admin where pass_hash = crypt(coalesce(p_pass,''), pass_hash)) then
    perform pg_sleep(1);
    raise exception 'رمز المدير غلط';
  end if;
end $$;

create or replace function public._driver(p_phone text, p_code text) returns public.drivers
language plpgsql security definer set search_path = public, extensions as $$
declare d drivers;
begin
  select * into d from drivers where phone = p_phone;
  if d.id is null or d.code_hash <> crypt(upper(coalesce(p_code,'')), d.code_hash) then
    perform pg_sleep(1);
    raise exception 'الرقم أو رمز الدخول غلط';
  end if;
  return d;
end $$;

-- public: list approved drivers -----------------------------------------
create or replace function public.list_drivers()
returns table(id uuid, name text, phone text, areas text[], types text[], prices jsonb, note text, available boolean)
language sql stable security definer set search_path = public as $$
  select id, name, phone, areas, types, prices, note, available
  from drivers where status = 'approved' order by available desc, created_at
$$;

-- driver: register -> returns a login code (shown once) ---------------------
create or replace function public.register_driver(p_name text, p_phone text, p_areas text[], p_types text[], p_prices jsonb, p_note text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare v_code text; v_prices jsonb := _clean_prices(p_prices);
begin
  if exists (select 1 from drivers where phone = p_phone) then
    raise exception 'هذا الرقم مسجّل من قبل — ادخل برمز الدخول حقك';
  end if;
  if (select count(*) from drivers where created_at > now() - interval '1 hour') > 30 then
    raise exception 'ضغط تسجيلات كثير، حاول بعد شوي';
  end if;
  if v_prices = '{}'::jsonb then raise exception 'اكتب سعر حجم واحد على الأقل'; end if;
  if not (p_types <@ array['drink','use']) then raise exception 'نوع الماي غير صحيح'; end if;
  v_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
  insert into drivers(name, phone, areas, types, prices, note, code_hash)
  values (trim(p_name), p_phone, p_areas, p_types, v_prices, nullif(trim(p_note), ''), crypt(v_code, gen_salt('bf')));
  return json_build_object('code', v_code);
end $$;

-- driver: view / edit own record ------------------------------------------
create or replace function public.driver_get(p_phone text, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare d drivers := _driver(p_phone, p_code);
begin
  return json_build_object('name', d.name, 'phone', d.phone, 'areas', d.areas, 'types', d.types,
    'prices', d.prices, 'note', d.note, 'available', d.available, 'status', d.status);
end $$;

create or replace function public.driver_update(p_phone text, p_code text, p_name text, p_areas text[], p_types text[], p_prices jsonb, p_note text, p_available boolean)
returns json language plpgsql security definer set search_path = public as $$
declare d drivers := _driver(p_phone, p_code); v_prices jsonb := _clean_prices(p_prices);
begin
  if v_prices = '{}'::jsonb then raise exception 'اكتب سعر حجم واحد على الأقل'; end if;
  if not (p_types <@ array['drink','use']) then raise exception 'نوع الماي غير صحيح'; end if;
  update drivers set name = trim(p_name), areas = p_areas, types = p_types, prices = v_prices,
    note = nullif(trim(p_note), ''), available = p_available, updated_at = now()
  where id = d.id;
  return driver_get(p_phone, p_code);
end $$;

create or replace function public.driver_set_available(p_phone text, p_code text, p_available boolean)
returns json language plpgsql security definer set search_path = public as $$
declare d drivers := _driver(p_phone, p_code);
begin
  update drivers set available = p_available, updated_at = now() where id = d.id;
  return driver_get(p_phone, p_code);
end $$;

-- admin -------------------------------------------------------------------
-- first time only: sets the admin passcode (works once, while none is set)
create or replace function public.admin_claim(p_pass text)
returns json language plpgsql security definer set search_path = public, extensions as $$
begin
  if exists (select 1 from app_admin) then raise exception 'رمز المدير محدد من قبل'; end if;
  if char_length(coalesce(p_pass,'')) < 6 then raise exception 'الرمز لازم 6 أحرف أو أرقام على الأقل'; end if;
  insert into app_admin(id, pass_hash) values (1, crypt(p_pass, gen_salt('bf')));
  return json_build_object('ok', true);
end $$;

create or replace function public.admin_state()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('claimed', exists (select 1 from app_admin))
$$;

create or replace function public.admin_list(p_pass text)
returns table(id uuid, created_at timestamptz, name text, phone text, areas text[], types text[], prices jsonb, note text, available boolean, status text)
language plpgsql security definer set search_path = public as $$
begin
  perform _check_admin(p_pass);
  return query select d.id, d.created_at, d.name, d.phone, d.areas, d.types, d.prices, d.note, d.available, d.status
    from drivers d order by (d.status = 'pending') desc, d.created_at desc;
end $$;

create or replace function public.admin_set_status(p_pass text, p_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _check_admin(p_pass);
  if p_status not in ('pending','approved','blocked') then raise exception 'حالة غير صحيحة'; end if;
  update drivers set status = p_status, updated_at = now() where id = p_id;
end $$;

create or replace function public.admin_delete(p_pass text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform _check_admin(p_pass);
  delete from drivers where id = p_id;
end $$;

-- who may call what ---------------------------------------------------------
revoke all on function public._clean_prices(jsonb), public._check_admin(text), public._driver(text, text) from public, anon, authenticated;
grant execute on function
  public.list_drivers(),
  public.register_driver(text, text, text[], text[], jsonb, text),
  public.driver_get(text, text),
  public.driver_update(text, text, text, text[], text[], jsonb, text, boolean),
  public.driver_set_available(text, text, boolean),
  public.admin_claim(text), public.admin_state(),
  public.admin_list(text), public.admin_set_status(text, uuid, text), public.admin_delete(text, uuid)
to anon, authenticated;

-- driver: delete own account
create or replace function public.driver_delete(p_phone text, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare d drivers := _driver(p_phone, p_code);
begin
  delete from drivers where id = d.id;
  return json_build_object('ok', true);
end $$;
grant execute on function public.driver_delete(text, text) to anon, authenticated;
