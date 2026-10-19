-- سُقيا: السايق يظهر على طول بعد التسجيل (بدون موافقة المدير) + حجم 650 جالون
-- الصقه في SQL Editor واضغط Run
alter table public.drivers alter column status set default 'approved';
update public.drivers set status = 'approved' where status = 'pending';

create or replace function public._clean_prices(p jsonb) returns jsonb
language sql immutable set search_path = public as $$
  select coalesce(jsonb_object_agg(k, round((v #>> '{}')::numeric, 3)), '{}'::jsonb)
  from jsonb_each(coalesce(p, '{}'::jsonb)) as e(k, v)
  where k in ('650','1000','2000','3000','5000')
    and jsonb_typeof(v) = 'number' and (v #>> '{}')::numeric > 0 and (v #>> '{}')::numeric < 1000
$$;
revoke all on function public._clean_prices(jsonb) from public, anon, authenticated;
