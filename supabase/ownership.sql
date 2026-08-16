-- Astrovoyage buyer ownership migration
-- Run this once in Supabase SQL Editor before distributing the builder.
-- The browser uses Supabase Auth; RLS is the database security boundary.

create table if not exists public.ships (
  token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ships enable row level security;

drop policy if exists "buyers can read own ships" on public.ships;
drop policy if exists "buyers can create own ships" on public.ships;
drop policy if exists "buyers can update own ships" on public.ships;
drop policy if exists "buyers can delete own ships" on public.ships;

create policy "buyers can read own ships" on public.ships
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "buyers can create own ships" on public.ships
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "buyers can update own ships" on public.ships
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "buyers can delete own ships" on public.ships
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists ships_user_id_idx on public.ships(user_id);
create index if not exists ships_updated_at_idx on public.ships(updated_at desc);

grant select, insert, update, delete on public.ships to authenticated;
revoke all on public.ships from anon;

-- Compatibility RPCs used by the existing builder.
-- They now bind every ship operation to auth.uid().
create or replace function public.save_ship(p_token text, p_data jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  insert into public.ships(token, user_id, data, updated_at)
  values (p_token, (select auth.uid()), coalesce(p_data, '{}'::jsonb), now())
  on conflict (token) do update
    set data = excluded.data,
        updated_at = now()
    where public.ships.user_id = (select auth.uid());

  if not found then
    raise exception 'Ship belongs to another account';
  end if;
end;
$$;

create or replace function public.get_ship(p_token text)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select data
  from public.ships
  where token = p_token
    and user_id = (select auth.uid())
  limit 1;
$$;

grant execute on function public.save_ship(text, jsonb) to authenticated;
grant execute on function public.get_ship(text) to authenticated;
revoke execute on function public.save_ship(text, jsonb) from anon;
revoke execute on function public.get_ship(text) from anon;

-- Ship-library helper. The UI can also query public.ships directly under RLS.
create or replace function public.list_my_ships()
returns table(token text, data jsonb, created_at timestamptz, updated_at timestamptz)
language sql
security invoker
set search_path = public
as $$
  select s.token, s.data, s.created_at, s.updated_at
  from public.ships s
  where s.user_id = (select auth.uid())
  order by s.updated_at desc;
$$;

grant execute on function public.list_my_ships() to authenticated;
revoke execute on function public.list_my_ships() from anon;
