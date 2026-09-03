-- PAROGLU MEDIA V3 MIGRATION
-- Supabase > SQL Editor > New query > paste all > Run

create extension if not exists pgcrypto;

-- Existing project table upgrades
alter table if exists public.projects add column if not exists category text;
alter table if exists public.projects add column if not exists content_type text;
alter table if exists public.projects add column if not exists media_url text;
alter table if exists public.projects add column if not exists media_type text;
alter table if exists public.projects add column if not exists ratio text default '16:9';
alter table if exists public.projects add column if not exists filter_tags text;
alter table if exists public.projects add column if not exists sort_order integer default 0;
alter table if exists public.projects add column if not exists featured boolean default false;

-- Brand carousel upgrades
alter table if exists public.brands add column if not exists row_no integer default 1;

-- CMS content table
create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  section text not null default 'general',
  label text,
  updated_at timestamptz not null default now()
);

-- Media library. Original uploaded file is preserved; ratio is display metadata only.
create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  title text,
  file_url text not null,
  storage_path text not null,
  media_type text not null default 'image',
  ratio text not null default 'original',
  alt_text text,
  file_name text,
  file_size bigint,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.media_library enable row level security;

-- Generic updated_at function (safe if already exists)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at before update on public.site_content for each row execute function public.set_updated_at();

-- RLS: content public read, only admin write
DROP POLICY IF EXISTS "site_content_public_read" ON public.site_content;
DROP POLICY IF EXISTS "site_content_admin_insert" ON public.site_content;
DROP POLICY IF EXISTS "site_content_admin_update" ON public.site_content;
DROP POLICY IF EXISTS "site_content_admin_delete" ON public.site_content;
create policy "site_content_public_read" on public.site_content for select to anon, authenticated using (true);
create policy "site_content_admin_insert" on public.site_content for insert to authenticated with check ((auth.jwt() ->> 'email')='umutparoglu87@gmail.com');
create policy "site_content_admin_update" on public.site_content for update to authenticated using ((auth.jwt() ->> 'email')='umutparoglu87@gmail.com') with check ((auth.jwt() ->> 'email')='umutparoglu87@gmail.com');
create policy "site_content_admin_delete" on public.site_content for delete to authenticated using ((auth.jwt() ->> 'email')='umutparoglu87@gmail.com');

DROP POLICY IF EXISTS "media_public_read" ON public.media_library;
DROP POLICY IF EXISTS "media_admin_insert" ON public.media_library;
DROP POLICY IF EXISTS "media_admin_update" ON public.media_library;
DROP POLICY IF EXISTS "media_admin_delete" ON public.media_library;
create policy "media_public_read" on public.media_library for select to anon, authenticated using (true);
create policy "media_admin_insert" on public.media_library for insert to authenticated with check ((auth.jwt() ->> 'email')='umutparoglu87@gmail.com');
create policy "media_admin_update" on public.media_library for update to authenticated using ((auth.jwt() ->> 'email')='umutparoglu87@gmail.com') with check ((auth.jwt() ->> 'email')='umutparoglu87@gmail.com');
create policy "media_admin_delete" on public.media_library for delete to authenticated using ((auth.jwt() ->> 'email')='umutparoglu87@gmail.com');

-- Storage bucket for original-quality images/videos/logos
insert into storage.buckets (id,name,public,file_size_limit)
values ('media','media',true,524288000)
on conflict (id) do update set public=true, file_size_limit=524288000;

DROP POLICY IF EXISTS "media_bucket_public_read" ON storage.objects;
DROP POLICY IF EXISTS "media_bucket_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "media_bucket_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "media_bucket_admin_delete" ON storage.objects;
create policy "media_bucket_public_read" on storage.objects for select to public using (bucket_id='media');
create policy "media_bucket_admin_insert" on storage.objects for insert to authenticated with check (bucket_id='media' and (auth.jwt() ->> 'email')='umutparoglu87@gmail.com');
create policy "media_bucket_admin_update" on storage.objects for update to authenticated using (bucket_id='media' and (auth.jwt() ->> 'email')='umutparoglu87@gmail.com') with check (bucket_id='media' and (auth.jwt() ->> 'email')='umutparoglu87@gmail.com');
create policy "media_bucket_admin_delete" on storage.objects for delete to authenticated using (bucket_id='media' and (auth.jwt() ->> 'email')='umutparoglu87@gmail.com');

-- Default editable copy. Existing values are never overwritten.
insert into public.site_content(key,value,section,label) values
('nav.about','Hakkımda','Navigasyon','Hakkımda menüsü'),
('nav.services','Hizmetler','Navigasyon','Hizmetler menüsü'),
('nav.work','İşler','Navigasyon','İşler menüsü'),
('nav.quote','Teklif Al','Navigasyon','Teklif Al butonu'),
('nav.contact','İletişim','Navigasyon','İletişim menüsü'),
('home.hero_kicker','UMUT PAROĞLU · CREATIVE STUDIO','Ana Sayfa','Hero üst yazı'),
('home.hero_line1','Görünen değil,','Ana Sayfa','Hero slogan 1'),
('home.hero_line2','hatırlanan işler.','Ana Sayfa','Hero slogan 2'),
('home.hero_copy','Reels, fotoğraf, grafik tasarım, sosyal medya, drone ve dijital deneyimleri tek bir kreatif dünyada buluşturuyorum.','Ana Sayfa','Hero açıklama'),
('home.hero_cta1','İşleri Keşfet ↗','Ana Sayfa','Hero buton 1'),
('home.hero_cta2','Bir Proje Başlat','Ana Sayfa','Hero buton 2'),
('home.featured_kicker','PORTFOLYO','Ana Sayfa','Seçili işler üst yazı'),
('home.featured_title','Seçili İşler','Ana Sayfa','Seçili işler başlık'),
('home.featured_cta','Tüm İşleri Gör','Ana Sayfa','Seçili işler buton'),
('home.services_kicker','NE ÜRETİYORUM?','Ana Sayfa','Hizmetler üst yazı'),
('home.services_title','Hizmetler','Ana Sayfa','Hizmetler başlık'),
('home.brands_kicker','REFERANSLAR','Ana Sayfa','Markalar üst yazı'),
('home.brands_title','Çalıştığım Markalar','Ana Sayfa','Markalar başlık'),
('brands.carousel_limit','14','Markalar','Dönen maksimum marka sayısı'),
('brands.speed_seconds','34','Markalar','Logo akış süresi (saniye)'),
('works.kicker','PORTFOLYO / 2022—2026','İşler','Üst yazı'),
('works.title','İşler','İşler','Başlık'),
('works.lead','Önce işin türü, sonra proje. Sosyal medya, spor, konser, Reels, fotoğraf, tasarım, drone ve dijital üretimleri aynı şablona sıkıştırmadan sergiliyorum.','İşler','Açıklama'),
('services.kicker','NE ÜRETİYORUM?','Hizmetler','Üst yazı'),
('services.title','Hizmetler','Hizmetler','Başlık'),
('services.lead','Tek bir format satmıyorum. Markanın hedefini, platformu ve kullanım biçimini anlayıp doğru üretim kombinasyonunu kuruyorum.','Hizmetler','Açıklama'),
('service.reels.title','Film / Reels','Hizmetler','Film/Reels başlık'),
('service.reels.summary','Reklam filmi, Reels, etkinlik, konser, kurumsal tanıtım, ürün ve mekân videoları.','Hizmetler','Film/Reels özet'),
('service.reels.process','Brief → fikir → çekim planı → prodüksiyon → kurgu → revizyon → teslim.','Hizmetler','Film/Reels süreç'),
('service.reels.myth','İyi Reels sadece hızlı kurgu değildir. İlk saniye, hikâye ve izleme davranışı birlikte düşünülür.','Hizmetler','Film/Reels not'),
('service.photo.title','Fotoğraf','Hizmetler','Fotoğraf başlık'),
('service.photo.summary','Spor, etkinlik, ürün, portre ve kurumsal fotoğraf çekimleri.','Hizmetler','Fotoğraf özet'),
('service.design.title','Tasarım','Hizmetler','Tasarım başlık'),
('service.design.summary','Kampanya görselleri, sosyal medya, afiş, baskı ve marka iletişimi.','Hizmetler','Tasarım özet'),
('service.social.title','Sosyal Medya','Hizmetler','Sosyal medya başlık'),
('service.social.summary','Sayfa yönetimi, içerik planlaması, Reels, tasarım ve çekim süreçlerinin birlikte yönetimi.','Hizmetler','Sosyal medya özet'),
('service.drone.title','Drone','Hizmetler','Drone başlık'),
('service.drone.summary','Mimari, etkinlik, spor ve reklam projelerinde sinematik hava çekimleri.','Hizmetler','Drone özet'),
('service.digital.title','Digital','Hizmetler','Digital başlık'),
('service.digital.summary','Portfolyo siteleri, landing page’ler ve yaratıcı web deneyimleri.','Hizmetler','Digital özet'),
('about.kicker','UMUT PAROĞLU','Hakkımda','Üst yazı'),
('about.title','Hakkımda','Hakkımda','Başlık'),
('about.headline','Bir işi sadece üretmiyorum; nasıl hatırlanacağını da düşünüyorum.','Hakkımda','Ana cümle'),
('about.p1','24 yaşındayım. Dört yılı aşkın süredir profesyonel olarak reklam ajansı dünyasının içinde video, fotoğraf, grafik tasarım, sosyal medya ve içerik üretimi üzerine çalışıyorum. Bu sürecin öncesinde de amatör olarak görsel üretim yapıyordum.','Hakkımda','Paragraf 1'),
('about.p2','Paroglu Media; Reels kurgusundan çekime, fotoğraftan tasarıma, drone görüntülerinden web deneyimlerine kadar farklı disiplinleri tek bir görsel bakış altında topladığım kişisel kreatif markam.','Hakkımda','Paragraf 2'),
('about.stat1_value','4+','Hakkımda','İstatistik 1 değer'),
('about.stat1_label','Yıl profesyonel deneyim','Hakkımda','İstatistik 1 açıklama'),
('about.stat2_value','1000+','Hakkımda','İstatistik 2 değer'),
('about.stat2_label','Üretilen içerik / kreatif çıktı','Hakkımda','İstatistik 2 açıklama'),
('about.stat3_value','360°','Hakkımda','İstatistik 3 değer'),
('about.stat3_label','Çok disiplinli kreatif üretim','Hakkımda','İstatistik 3 açıklama'),
('about.manifesto_title','Tek bir uzmanlık değil, tek bir bakış açısı.','Hakkımda','Manifesto başlık'),
('about.manifesto_text','Bir projede gerektiğinde kamera arkasında, gerektiğinde kurgu masasında, gerektiğinde tasarım ekranında olabilmek; ortaya çıkan işin parçalarının birbirinden kopmamasını sağlıyor.','Hakkımda','Manifesto metin'),
('contact.kicker','BİR ŞEY ÜRETELİM','İletişim','Üst yazı'),
('contact.title','İletişim','İletişim','Başlık'),
('contact.big','Aklındaki işi<br><span style="color:var(--purple2)">anlat.</span>','İletişim','Büyük cümle'),
('contact.email','umutparoglu87@gmail.com','İletişim','E-posta'),
('contact.email_href','mailto:umutparoglu87@gmail.com','İletişim','E-posta linki'),
('contact.phone','+90 541 662 98 62','İletişim','Telefon'),
('contact.phone_href','tel:+905416629862','İletişim','Telefon linki'),
('contact.instagram','@iamparoglu ↗','İletişim','Instagram'),
('contact.instagram_href','https://instagram.com/iamparoglu','İletişim','Instagram linki'),
('footer.cta_start','Bir sonraki işi','Footer','CTA başlangıç'),
('footer.cta_link','birlikte yapalım.','Footer','CTA link'),
('footer.disciplines','Reels · Fotoğraf · Tasarım · Sosyal Medya · Drone · Digital','Footer','Disiplinler')
on conflict (key) do nothing;
