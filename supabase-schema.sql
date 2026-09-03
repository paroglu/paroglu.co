-- Paroglu Media / Supabase setup
-- Run once in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client text,
  tags text,
  year integer default 2026,
  description text,
  cover_url text,
  project_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  url text,
  logo_url text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  name text,
  company text,
  email text,
  phone text,
  service text,
  project_type text,
  budget text,
  deadline text,
  city text,
  notes text,
  status text not null default 'Yeni',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists brands_updated_at on public.brands;
create trigger brands_updated_at before update on public.brands
for each row execute function public.set_updated_at();

drop trigger if exists briefs_updated_at on public.briefs;
create trigger briefs_updated_at before update on public.briefs
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.brands enable row level security;
alter table public.briefs enable row level security;

-- Cleanly recreate policies if script is run again.
drop policy if exists "projects_public_read" on public.projects;
drop policy if exists "projects_admin_insert" on public.projects;
drop policy if exists "projects_admin_update" on public.projects;
drop policy if exists "projects_admin_delete" on public.projects;
drop policy if exists "brands_public_read" on public.brands;
drop policy if exists "brands_admin_insert" on public.brands;
drop policy if exists "brands_admin_update" on public.brands;
drop policy if exists "brands_admin_delete" on public.brands;
drop policy if exists "briefs_public_insert" on public.briefs;
drop policy if exists "briefs_admin_read" on public.briefs;
drop policy if exists "briefs_admin_update" on public.briefs;
drop policy if exists "briefs_admin_delete" on public.briefs;

create policy "projects_public_read"
on public.projects for select
to anon, authenticated
using (published = true or (auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "projects_admin_insert"
on public.projects for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "projects_admin_update"
on public.projects for update
to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com')
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "projects_admin_delete"
on public.projects for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "brands_public_read"
on public.brands for select
to anon, authenticated
using (visible = true or (auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "brands_admin_insert"
on public.brands for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "brands_admin_update"
on public.brands for update
to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com')
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "brands_admin_delete"
on public.brands for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

-- Website visitors may submit a brief but cannot read existing briefs.
create policy "briefs_public_insert"
on public.briefs for insert
to anon, authenticated
with check (true);

create policy "briefs_admin_read"
on public.briefs for select
to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "briefs_admin_update"
on public.briefs for update
to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com')
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "briefs_admin_delete"
on public.briefs for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');
