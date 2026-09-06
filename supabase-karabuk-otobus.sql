-- PAROGLU MEDIA — KARABÜK İDMAN YURDU OTOBÜS TASARIMI
-- Supabase > SQL Editor > New query > tamamını yapıştır > Run
-- Aynı proje varsa günceller, yoksa ekler.

do $$
declare
  affected integer;
begin
  update public.projects
  set
    category = 'Tasarım',
    content_type = 'Araç Giydirme',
    title = 'Karabük İdman Yurdu Otobüs Tasarımı',
    client = 'Karabük İdman Yurdu',
    tags = 'Otobüs Kaplama, Araç Giydirme, Spor Kimliği, Büyük Format',
    filter_tags = 'design,sport',
    year = 2026,
    ratio = '16:9',
    description = 'Karabük İdman Yurdu için kulüp kimliğini, arma ve takım renklerini otobüsün tüm yüzeylerine taşıyan büyük format araç giydirme ve kaplama tasarımı.',
    cover_url = 'karabuk-otobus-01.jpg',
    media_url = null,
    media_type = 'image',
    project_url = 'karabuk-otobus-tasarimi.html',
    sort_order = 6,
    featured = true,
    published = true
  where project_url = 'karabuk-otobus-tasarimi.html'
     or lower(coalesce(title,'')) = lower('Karabük İdman Yurdu Otobüs Tasarımı');

  get diagnostics affected = row_count;

  if affected = 0 then
    insert into public.projects
      (category, content_type, title, client, tags, filter_tags, year, ratio, description, cover_url, media_type, project_url, sort_order, featured, published)
    values
      ('Tasarım','Araç Giydirme','Karabük İdman Yurdu Otobüs Tasarımı','Karabük İdman Yurdu','Otobüs Kaplama, Araç Giydirme, Spor Kimliği, Büyük Format','design,sport',2026,'16:9','Karabük İdman Yurdu için kulüp kimliğini, arma ve takım renklerini otobüsün tüm yüzeylerine taşıyan büyük format araç giydirme ve kaplama tasarımı.','karabuk-otobus-01.jpg','image','karabuk-otobus-tasarimi.html',6,true,true);
  end if;
end $$;
