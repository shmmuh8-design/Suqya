-- سُقيا: البلاغات داخل التطبيق (بدون واتساب). تشوفها من Table Editor ← driver_reports
create table if not exists public.driver_reports (
  id         bigserial primary key,
  driver_id  uuid references public.drivers(id) on delete cascade,
  reason     text not null default '',
  created_at timestamptz not null default now()
);
alter table public.driver_reports enable row level security;
revoke all on public.driver_reports from anon, authenticated;

create or replace function public.report_driver(p_id uuid, p_reason text)
returns void language sql security definer set search_path = public as $$
  insert into driver_reports(driver_id, reason) values (p_id, left(coalesce(p_reason, ''), 500));
$$;
grant execute on function public.report_driver(uuid, text) to anon, authenticated;
