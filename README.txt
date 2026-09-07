PAROGLU MEDIA — V7.2.5 / SCROLL FIX

Bu paket sadece giriş sahnesindeki scroll davranışını düzeltir.

Değişiklikler:
- Giriş artık 100vh statik blok değil, 230–240vh scroll alanı + 100vh sticky sahne.
- PAROGLU krom yazısı scroll sırasında yukarı/geriye hareket edip yumuşakça kaybolur.
- Otobüs proje penceresi scroll ile küçük portaldan büyük sinematik pencereye dönüşür.
- "SCROLL TO ENTER" ekranın altında sabit kalır ve ilk scroll hareketinde kaybolur.
- Chrome görselindeki gereksiz transparan boşluklar kırpıldı; iPad/desktop'ta yazı kesilmez.
- Ana sayfanın geri kalan HTML yapısına, app.js'e, Supabase'e ve data-store.js'e dokunulmadı.

Yükleme:
1) ZIP'i aç.
2) index.html, styles.css, paroglu-chrome.png ve karabuk-otobus-01.jpg dosyalarını repo ana dizinine yükle.
3) Aynı isimli dosyaların üzerine yaz.
4) app.js / backend-config.js / data-store.js dosyalarına dokunma.
