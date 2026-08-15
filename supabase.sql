-- Run this once in Supabase SQL Editor.
create table if not exists public.ships (
  share_token uuid primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ships enable row level security;

revoke all on public.ships from anon, authenticated;

drop function if exists public.get_ship(uuid);
drop function if exists public.save_ship(uuid,jsonb);

create or replace function public.get_ship(p_token uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select data from public.ships where share_token = p_token;
$$;

create or replace function public.save_ship(p_token uuid, p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ships(share_token,data,updated_at)
  values(p_token,p_data,now())
  on conflict (share_token) do update
    set data=excluded.data, updated_at=now();
  return p_data;
end;
$$;

grant execute on function public.get_ship(uuid) to anon, authenticated;
grant execute on function public.save_ship(uuid,jsonb) to anon, authenticated;
