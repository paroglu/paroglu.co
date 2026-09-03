# Paroglu Media V2 — GitHub Pages

Bu paket GitHub Pages için düz kök dizin yapısında hazırlanmıştır. ZIP içindeki dosyaların tamamını repository köküne yükleyin.

## V2'de değişenler
- Yüklenen 10 saniyelik video ana hero/showreel alanına eklendi ve web için optimize edildi.
- Slogan video üzerinde daha minimal ve ortalı hale getirildi.
- Gerçek Paroglu Media logosunun şeffaf PNG ve koyu arayüz için light varyantı eklendi.
- İşler sayfası desktop / tablet / telefon için yeniden düzenlendi; filtre geçişleri FLIP animasyonu ile kaymadan çalışır.
- Hizmetler alanı açılır detaylar, süreç ve brief CTA'ları ile genişletildi.
- Paroglu Asistan; hizmet, fiyat yaklaşımı, iletişim, teslim, revizyon, spor, konser ve portfolyo sorularını yanıtlayan daha güçlü yerel akışa geçirildi.
- Yönetim paneli public menü/footer'dan kaldırıldı ve güvenli admin giriş katmanına hazırlandı.

## Yönetim paneli güvenliği
GitHub Pages statiktir; tek başına güvenli kullanıcı girişi sağlayamaz. Bu nedenle V2'de `panel.html` backend ayarı yapılmadan kilitli kalır.

Gerçek admin girişi için:
1. Supabase projesi oluşturun.
2. `supabase-schema.sql` dosyasını Supabase SQL Editor'da çalıştırın.
3. Supabase Authentication altında yalnızca admin hesabınızı oluşturun.
4. `backend-config.js` içindeki `supabaseUrl` ve `supabaseAnonKey` alanlarını doldurun.
5. Dosyayı GitHub'a yükleyin.

Panel girişinde yalnızca `backend-config.js` içindeki `adminEmail` hesabı kabul edilir. Veri erişimi ayrıca Supabase RLS politikalarıyla korunur.

## Not
Gerçek generative AI için API anahtarını frontend'e koymayın. GitHub Pages üzerinde API anahtarı gizlenemez. V2 asistanı API anahtarı gerektirmeyen, site ve satış akışına özel yerel yardımcı olarak çalışır; gerçek LLM bağlantısı ileride serverless/backend üzerinden yapılmalıdır.
