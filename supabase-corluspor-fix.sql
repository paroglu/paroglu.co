-- PAROGLU MEDIA — ÇORLUSPOR 1947 PROJECT FIX
-- Supabase > SQL Editor > New query > Run once.
-- Removes old Çorluspor project card records and creates one clean record.

delete from public.projects
where lower(coalesce(title,'')) like '%çorlu%'
   or lower(coalesce(client,'')) like '%çorlu%'
   or lower(coalesce(project_url,'')) like '%corluspor%';

insert into public.projects (
  title, client, tags, year, description, cover_url, project_url,
  published, category, content_type, ratio, filter_tags, sort_order, featured
) values (
  'Çorluspor 1947',
  'Çorluspor 1947',
  'Maç Günü, İlk 11, Maç Sonucu, Kupa',
  2026,
  'Çorluspor 1947 için hazırlanan sosyal medya maç günü, ilk 11, maç sonucu ve kupa tasarımları.',
  'corluspor-1947-01.jpg',
  'corluspor.html',
  true,
  'Sosyal Medya',
  'Spor',
  '4:5',
  'social,sport,design',
  30,
  false
);
