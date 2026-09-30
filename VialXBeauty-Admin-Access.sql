-- VialXBeauty admin access
-- This makes the current admin user the only account allowed into /admin.html.
-- User UID: e92620bb-7816-4439-a10d-3e0eeb58ad35

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = 'e92620bb-7816-4439-a10d-3e0eeb58ad35'::uuid;
$$;

grant execute on function public.is_admin() to authenticated;
