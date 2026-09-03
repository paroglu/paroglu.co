# Paroglu Media V3

GitHub Pages için statik frontend + Supabase tabanlı güvenli admin/CMS/CRM.

## V3 değişiklikleri
- Hero videosu kaldırıldı; animasyonlu tipografik slogan kullanılıyor.
- Menü: Hakkımda → Hizmetler → İşler → Teklif Al → İletişim.
- Teklif Al butonu mor vurgu rengine sahip.
- İşler sayfası mobil/tablet/desktop için yeniden düzenlendi; 9:16, 16:9, 4:5, 1:1 kart oranlarını destekliyor.
- İş kartlarında kategori / içerik türü öncelikli, firma bilgisi ikincil.
- Hizmetler ve ana sayfadaki “Ne Üretiyorum?” satırları açılır detaylara sahip.
- Hakkımda bölümü profesyonelleştirildi: 4+ yıl, 1000+ üretim vb. içerikler panelden düzenlenebilir.
- Telefon: +90 541 662 98 62.
- Yüksek çözünürlüklü şeffaf Paroglu Media logosu eklendi.
- Admin panel: Site Yazıları, Projeler, Medya Kütüphanesi, Marka Logoları, Talepler.
- Medya yükleme orijinal dosyayı sıkıştırmadan Supabase Storage'a yollar; 9:16 / 16:9 / 4:5 / 1:1 / original oran metadatası desteklenir.
- Logo carousel satırı, sırası, görünürlüğü, maksimum logo adedi ve hız panelden yönetilebilir.

## Bir kerelik Supabase V3 kurulumu
Mevcut Supabase projesinde:
1. SQL Editor → New query.
2. `supabase-v3-migration.sql` dosyasının tamamını yapıştır.
3. Run.

Bu migration mevcut V2 tablolarını silmez. Yeni alanları, Site Yazıları tablosunu, Medya Kütüphanesini ve `media` Storage bucket/policy'lerini ekler.

## GitHub Pages
Bu klasörün içindeki dosyaları repo köküne yükle / mevcut V2 dosyalarının üzerine yaz. `backend-config.js` mevcut Supabase public bağlantı bilgileriyle hazırlanmıştır.

## Admin
`panel.html`

Giriş yalnızca `backend-config.js` içindeki admin e-posta adresi ve Supabase Authentication hesabı ile açılır. Veritabanı/Storage write işlemleri RLS ile aynı admin e-postasına sınırlandırılmıştır.
