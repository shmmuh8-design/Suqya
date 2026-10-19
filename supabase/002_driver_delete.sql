-- سُقيا: السايق يقدر يحذف حسابه بنفسه (شرط من أبل) — الصقه في SQL Editor واضغط Run
create or replace function public.driver_delete(p_phone text, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare d drivers := _driver(p_phone, p_code);
begin
  delete from drivers where id = d.id;
  return json_build_object('ok', true);
end $$;
grant execute on function public.driver_delete(text, text) to anon, authenticated;
