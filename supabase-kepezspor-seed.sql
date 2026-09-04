-- PAROGLU MEDIA — KEPEZSPOR PROJECT SEED
-- Supabase > SQL Editor > New query > paste all > Run
-- Existing Kepezspor row varsa günceller, yoksa yeni proje ekler.

do $$
declare
  affected integer;
begin
  update public.projects
  set
    category = 'Sosyal Medya',
    content_type = 'Spor',
    title = 'Maç Günü Tasarımları',
    client = 'Kepezspor',
    tags = 'Maç Günü, Tasarım, Spor İletişimi',
    filter_tags = 'social,sport,design',
    year = 2026,
    ratio = '4:5',
    description = 'Kepezspor için maç haftası atmosferini, rakip hikâyesini ve kulüp kimliğini öne çıkaran sosyal medya maç günü tasarım serisi.',
    cover_url = 'kepezspor-matchday-01.jpg',
    media_url = null,
    media_type = 'image',
    project_url = 'kepezspor.html',
    sort_order = 2,
    featured = true,
    published = true
  where lower(coalesce(client,'')) like 'kepez%'
     or lower(coalesce(title,'')) like 'kepez%'
     or project_url = 'kepezspor.html';

  get diagnostics affected = row_count;

  if affected = 0 then
    insert into public.projects
      (category, content_type, title, client, tags, filter_tags, year, ratio, description, cover_url, media_type, project_url, sort_order, featured, published)
    values
      ('Sosyal Medya','Spor','Maç Günü Tasarımları','Kepezspor','Maç Günü, Tasarım, Spor İletişimi','social,sport,design',2026,'4:5','Kepezspor için maç haftası atmosferini, rakip hikâyesini ve kulüp kimliğini öne çıkaran sosyal medya maç günü tasarım serisi.','kepezspor-matchday-01.jpg','image','kepezspor.html',2,true,true);
  end if;
end $$;
