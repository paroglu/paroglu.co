# Paroglu Media V4

Bu paket V3 üzerine güncelleme olarak hazırlanmıştır. Mevcut Supabase projesi, admin kullanıcısı ve veriler korunur.

## V4'te gelenler
- Logo odaklı açılış / yükleme animasyonu (ana sayfada daha uzun, iç sayfalarda daha kısa)
- Sayfalar arası mor Paroglu Media geçiş animasyonu
- Ana hero'da videosuz, hareketli tipografik/ambient kompozisyon
- Hakkımda / Hizmetler / İşler / İletişim sayfalarında giriş ve başlık animasyonları
- İşler kartlarında fotoğraf-video crossfade ve daha yumuşak filtre reflow animasyonu
- Menüde İşler hover alanında panelden `featured` seçilen favori işler
- Marka/logolar için çalışan marquee animasyonu (V3'te keyframe eksikti)
- Admin girişinde başarılı oturum geçişi; giriş ekranı artık panelin üstünde kalmaz
- Admin panelinde toplu orijinal-kalite medya yükleme
- Admin panelinden proje, featured iş, marka logosu, site metni ve logo akış hızı yönetimi
- AI Asistan bilgi bankası: panelden soru / cevap / anahtar kelime ekleme-düzenleme-silme
- Reels, sosyal medya, fotoğraf, tasarım, drone, web, spor, konser, fiyat, teslim ve revizyon için hazır bot cevapları
- Proje niyeti algılandığında firma → hizmet → hedef → zaman → bütçe → iletişim akışı

## Kurulum / Güncelleme
1. V4 dosyalarını mevcut GitHub repo köküne yükle ve aynı isimli dosyaların üzerine yaz.
2. `backend-config.js` gerçek Supabase URL ve publishable key içeriyor olmalı.
3. Supabase > SQL Editor > New query içinde `supabase-v4-migration.sql` dosyasını bir kez çalıştır.
4. GitHub Pages deploy tamamlandıktan sonra siteyi ve `panel.html` admin girişini test et.

## Not
`supabase-v4-migration.sql` additive'dir: V3 tablolarını ve mevcut proje/marka/brief/medya verilerini silmez. Yeni AI bilgi bankasını ve V4 CMS ayarlarını ekler.
