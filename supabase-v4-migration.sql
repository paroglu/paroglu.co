-- PAROGLU MEDIA V4 MIGRATION
-- Run once in Supabase > SQL Editor after V3 migration.
-- Additive only: existing projects, brands, media and briefs are preserved.

create extension if not exists pgcrypto;

create table if not exists public.assistant_knowledge (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'Genel',
  question text not null,
  keywords text not null default '',
  answer text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists assistant_knowledge_question_uq on public.assistant_knowledge (lower(question));

alter table public.assistant_knowledge enable row level security;

drop policy if exists "assistant_public_read" on public.assistant_knowledge;
drop policy if exists "assistant_admin_insert" on public.assistant_knowledge;
drop policy if exists "assistant_admin_update" on public.assistant_knowledge;
drop policy if exists "assistant_admin_delete" on public.assistant_knowledge;

create policy "assistant_public_read"
on public.assistant_knowledge for select
to anon, authenticated
using (active = true or (auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "assistant_admin_insert"
on public.assistant_knowledge for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "assistant_admin_update"
on public.assistant_knowledge for update
to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com')
with check ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

create policy "assistant_admin_delete"
on public.assistant_knowledge for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'umutparoglu87@gmail.com');

-- Reuse V3 updated_at function if present.
drop trigger if exists assistant_knowledge_updated_at on public.assistant_knowledge;
create trigger assistant_knowledge_updated_at
before update on public.assistant_knowledge
for each row execute function public.set_updated_at();

-- Motion / display settings editable from CMS.
insert into public.site_content(key,value,section,label) values
('motion.intro_home_ms','1850','Motion','Ana sayfa açılış animasyonu süresi (ms)'),
('motion.intro_inner_ms','820','Motion','İç sayfa açılış animasyonu süresi (ms)'),
('home.featured_limit','6','Ana Sayfa','Ana sayfada gösterilecek öne çıkan iş sayısı')
on conflict (key) do nothing;



insert into public.site_content(key,value,section,label) values
('service.photo.process','Fotoğrafı yalnızca çekmek değil, nerede kullanılacağını bilerek kadrajlamak önemli. Kampanya, web, sosyal medya ve baskı için teslimler ayrı hazırlanabilir.','Hizmetler','Fotoğraf süreç'),
('service.photo.myth','Yüksek megapiksel tek başına iyi fotoğraf demek değildir; ışık, lens, kompozisyon ve son işlem sonucu belirler.','Hizmetler','Fotoğraf doğru bilinen yanlış'),
('service.design.process','Önce mesaj hiyerarşisi, sonra görsel dil. Tek bir güzel görsel yerine tekrar üretilebilir bir sistem kurmayı hedefliyorum.','Hizmetler','Tasarım süreç'),
('service.design.myth','Tasarım sadece güzel görünmek değildir; bilgiyi doğru sırayla okutmak ve markayı hatırlanır kılmaktır.','Hizmetler','Tasarım doğru bilinen yanlış'),
('service.social.process','İçerikler birbirinden bağımsız değil; profilin genel görünümü, yayın sıklığı, içerik çeşitliliği ve marka tonu birlikte düşünülür.','Hizmetler','Sosyal medya süreç'),
('service.social.myth','Sosyal medya yönetimi yalnızca post paylaşmak değildir. Düzenli içerik sistemi ve marka hafızası oluşturmak asıl iştir.','Hizmetler','Sosyal medya doğru bilinen yanlış'),
('service.drone.process','Drone görüntüsü sırf havadan çekilmiş olmak için kullanılmaz; hareket, ölçek ve sahnenin ritmi için planlanır.','Hizmetler','Drone süreç'),
('service.digital.process','Siteyi yalnızca bilgi veren sayfa olarak değil, markanın işlerini güçlü gösteren dijital deneyim olarak ele alıyorum.','Hizmetler','Digital süreç')
on conflict (key) do nothing;

-- Initial assistant knowledge. Admin panel can edit or delete these later.
insert into public.assistant_knowledge(category,question,keywords,answer,sort_order) values
('Reels / Video','Reels çekimi nasıl ilerliyor?','reels,video,çekim,kurgu,film','Önce hedefi ve yayın platformunu netleştiriyoruz. Ardından fikir, çekim planı, prodüksiyon, kurgu, renk/ses düzenleme ve revizyon geliyor. Teslimler 9:16 başta olmak üzere ihtiyaç varsa 16:9 ve 4:5 formatlarda hazırlanabiliyor.',10),
('Sosyal Medya','Sosyal medya yönetimi yapıyor musunuz?','sosyal medya,yönetim,sayfa,içerik planı,instagram','Evet. İçerik planı, sayfanın görsel dili, Reels ve tasarım üretimi, çekim planlaması ve yayın akışı birlikte kurgulanabiliyor. Amaç yalnızca paylaşım yapmak değil, markanın düzenli ve tanınır bir içerik sistemine sahip olması.',20),
('Fotoğraf','Fotoğraf çekimi yapıyor musunuz?','fotoğraf,ürün,portre,etkinlik,spor fotoğraf','Evet. Ürün, portre, spor, etkinlik ve kurumsal fotoğraf çekimleri yapılabilir. Çekim öncesinde kullanım alanına göre ışık, kadraj ve teslim oranları planlanır.',30),
('Tasarım','Hangi tasarım hizmetlerini veriyorsunuz?','tasarım,afiş,post,story,banner,baskı,kampanya','Sosyal medya post/story, kampanya görselleri, afiş, banner, baskı işleri ve marka iletişimi tasarımları üretiyorum. Tek görselden ziyade mümkün olduğunda tekrar kullanılabilir, tutarlı bir görsel sistem kuruyorum.',40),
('Drone','Drone çekimi yapıyor musunuz?','drone,hava çekimi,mimari,inşaat','Evet. Mimari, inşaat, etkinlik, spor, mekân ve reklam projelerinde sinematik hava çekimleri yapılabilir. Lokasyon ve uçuş koşulları çekim öncesinde değerlendirilir.',50),
('Web / Digital','Web sitesi yapıyor musunuz?','web,site,landing page,digital,portfolyo','Evet. Portfolyo, landing page ve kreatif web deneyimleri hazırlanabilir. Öncelik mobil uyum, hızlı açılış, güçlü portfolyo sunumu ve gerektiğinde yönetilebilir içerik altyapısıdır.',60),
('Spor','Spor kulüpleriyle çalışıyor musunuz?','spor,kulüp,futbol,maç günü,forma','Evet. Spor tarafında Reels, maç günü içerikleri, transfer/forma lansmanları, fotoğraf, grafik tasarım ve sosyal medya yönetimi birlikte üretilebilir.',70),
('Konser','Konser çekimi yapıyor musunuz?','konser,sahne,backstage,sanatçı,sefo','Evet. Sahne, backstage, kalabalık atmosferi ve sanatçı detaylarını kapsayan dikey Reels ve etkinlik videoları üretilebilir.',80),
('Fiyat / Süreç','Fiyatlar nasıl belirleniyor?','fiyat,ücret,bütçe,kaç tl,teklif','Fiyat; çekim süresi, lokasyon, ekip ihtiyacı, teslim adedi, kurgu yoğunluğu ve kullanım kapsamına göre belirlenir. En doğru fiyat için Teklif Al bölümündeki kısa brief yeterli.',90),
('Fiyat / Süreç','Teslim süresi ne kadar?','teslim,süre,kaç gün,ne zaman','Teslim süresi projenin kapsamına göre değişir. Kısa Reels çalışmalarında süreç daha hızlı olabilir; çoklu çekim, kampanya veya kapsamlı kurumsal işlerde takvim brief aşamasında netleştirilir.',100),
('Fiyat / Süreç','Revizyon hakkı var mı?','revizyon,değişiklik,düzeltme','Evet. Revizyon kapsamı iş başlamadan önce netleştirilir. Amaç projeyi sonsuz revizyon döngüsüne sokmadan briefte belirlenen hedefe en doğru şekilde ulaştırmaktır.',110),
('Genel','Hangi şehirlerde çalışıyorsunuz?','şehir,karabük,istanbul,ankara,nerede,lokasyon','Karabük merkezli çalışıyorum; proje kapsamına göre farklı şehirlerde çekim ve prodüksiyon planlanabilir. Şehri yazarsan ulaşım ve çekim planını ona göre değerlendirebiliriz.',120),
('Genel','İletişim bilgileri nedir?','telefon,whatsapp,iletişim,mail,email','Telefon: +90 541 662 98 62. E-posta: umutparoglu87@gmail.com. İstersen önce asistan üzerinden projenin kapsamını netleştirip ardından brief bırakabilirsin.',130)
on conflict do nothing;
