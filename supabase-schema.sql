-- Paroglu Media CMS / CRM schema
-- Run in Supabase SQL Editor. Change the admin email below if needed.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client text,
  tags text,
  year text,
  description text,
  cover_url text,
  project_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  url text,
  logo_url text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  service text,
  need_type text,
  budget text,
  timeline text,
  company text,
  name text,
  phone text,
  email text,
  goal text,
  message text,
  sector text,
  website text,
  colors text,
  channel text,
  status text not null default 'Yeni',
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.brands enable row level security;
alter table public.briefs enable row level security;

-- Public portfolio reads
create policy "public read published projects" on public.projects for select to anon using (published = true);
create policy "public read visible brands" on public.brands for select to anon using (visible = true);
-- Public can create a brief, but cannot read other briefs.
create policy "public submit brief" on public.briefs for insert to anon with check (true);

-- Only Umut's authenticated account can manage CMS/CRM data.
create policy "admin projects" on public.projects for all to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com')
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');
create policy "admin brands" on public.brands for all to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com')
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');
create policy "admin briefs" on public.briefs for all to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com')
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');
