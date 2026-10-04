# TAKİP — tasarım belgesi

**Tarih:** 4 Ekim 2026
**Durum:** Tasarım onaylandı, uygulama planı bekliyor

## 1. Amaç

Ali ve Yağmur'un her gün beş başlığı (ders, spor, yemek, su, uyku) işaretlediği,
birbirlerinin durumunu gördüğü bir iPhone uygulaması. Ana ekranda bugünün
durumunu gösteren bir widget olacak.

## 2. Kapsam

**Var:**
- Bugün ekranı: iki kişi yan yana, sadece kendi sütununa yazma
- Son 7 günün özeti ve bu günlerde kendi değerlerini düzeltme
- Firebase üzerinden iki telefon arasında senkron
- Scriptable widget'ı: küçük ve orta boy, sadece gösterir

**Yok (bilerek):**
- Widget'tan tik atma (Kısayollar butonları ya da gerçek iOS uygulaması gerekirdi)
- Seri (streak), aylık takvim, istatistik grafikleri
- Bildirim/hatırlatma
- Hesap sistemi, şifre, ikiden fazla kişi
- Karşı tarafın değerlerini değiştirme
- 7 günden eski günleri düzenleme

## 3. Kişiler ve kimlik

- İki sabit kişi var. Anahtarlar `ali` ve `yagmur`, ekranda **ALİ** ve **YAĞMUR** yazar.
- Her kişiye ayrı bir link gider:
  `https://temperdkm.github.io/takip/#oda=<ODA_KODU>&ben=ali`
- Uygulama açılınca adres çubuğunun `#` sonrasından `oda` ve `ben` değerlerini okur
  ve `localStorage`'a yazar. Sonraki açılışlarda `localStorage`'dan okur. `#` kısmı
  silinmez, ana ekrana eklenirken korunması için orada kalır.
- **Kurtarma ekranı:** Ne `#` kısmında ne `localStorage`'da `oda`/`ben` yoksa tek
  bir ekran açılır: "ALİ / YAĞMUR" seçimi ve oda kodu yapıştırma alanı. Doldurulunca
  `localStorage`'a yazılır.
- Oda kodu 24 karakter, rastgele `[a-z0-9]`. GitHub deposuna hiç girmez.

## 4. Ekranlar

### 4.1 Bugün (ana ekran)

- Üstte gün adı ve tarih ("PAZAR 4 EKİM") ve "Bugün" başlığı.
- Tablo: satırlar Ders, Spor, Yemek, Su, Uyku; sütunlar ALİ ve YAĞMUR.
  Kendi sütunun solda.
- **Ders / Spor / Yemek:** kendi hücrene dokununca tik açılır ya da kapanır.
- **Su:** dokununca hücrede sayı alanı açılır (`inputmode="decimal"`). Virgül ve
  nokta kabul edilir ("2,3" = 2.3). Alan kapanınca (blur ya da Enter) kaydedilir.
  Boş bırakılırsa değer silinir.
- **Uyku:** su ile aynı davranış, 0–24 saat.
- Karşı tarafın sütunu salt okunurdur, dokunmak bir şey yapmaz.
- Kaydet tuşu yoktur.

### 4.2 Son 7 gün

- Bugün tablosunun altında, bugünden önceki 7 gün listelenir, en yeni en üstte.
- Her satır: gün adı + tarih, her kişi için "3/4" biçiminde tik sayısı ve uyku saati.
- Bir satıra dokununca o günün tablosu açılır. Bugün tablosuyla aynı düzende olur,
  kendi sütunun düzenlenebilir. Geri tuşu Bugün'e döner.

### 4.3 Kurtarma ekranı

Bkz. §3.

### 4.4 Widget kurulumu

Bugün ekranının en altındaki bağlantıyla açılır. Kurulum adımları, "Betiği kopyala"
düğmesi ve geri tuşu var. Bkz. §10.

## 5. Kurallar

### 5.1 Gün sınırı: 04:00

- Gün anahtarı = telefonun yerel saatinden 4 saat çıkarılmış tarihin `YYYY-MM-DD` biçimi.
  - 5 Ekim 00:30 → `2026-10-04`
  - 5 Ekim 04:00 → `2026-10-05`
- Uyku için girilen saat, sabah girildiği günün anahtarına yazılır ("dün gece kaç
  saat uyudun").
- Uygulama açıkken 04:00 geçilirse ekran kendiliğinden yeni güne geçer (her yenileme
  döngüsünde gün anahtarı tekrar hesaplanır).

### 5.2 Tik sayımı

- Tiklenebilir dört başlık var: ders, spor, yemek, su.
- Su tik'i kaydedilmez, `su >= 2` ise tik sayılır.
- Uyku tik'e dönüşmez, sadece sayı olarak görünür.
- Tik sayısı = `ders + spor + yemek + (su >= 2)`, 4 üzerinden.

### 5.3 Giriş kontrolü

| Alan | Kabul | Geçersizse |
|---|---|---|
| su | sayı, 0 ≤ x ≤ 10 | Alanın altında "0–10 arası yaz". Kaydedilmez. |
| uyku | sayı, 0 ≤ x ≤ 24 | Alanın altında "0–24 arası yaz". Kaydedilmez. |

- Virgül noktaya çevrilir, en fazla 2 ondalık basamak tutulur.
- Gösterimde virgül kullanılır: `2,1`, `7,5`, tam sayıda ondalık yazılmaz (`6`).
- Girilmemiş değer "—" olarak görünür. Böylece 0 ile "girilmedi" karışmaz.

## 6. Görünüş (onaylanan yön: A, kömür)

- Zemin `#0C0F13`. Kutu yok, ayrımlar ince çizgi (`#1E242C`) ve boşlukla yapılır.
- Metin: başlık `#EEF1F5`, gövde `#C9CED6`, ikincil `#6B7380`, boş işaret `#3A424D`.
- Ölçü mavisi `#6FB4FF` yalnızca ölçülen değerlerde (su litresi, uyku saati) kullanılır.
- Font **Barlow** (Google Fonts). Rakamlar `font-variant-numeric: tabular-nums`.
- Seçim yeni bir renk değildir: dokunulan ya da düzenlenen hücrenin yüzeyi hafifçe
  yükselir ve üst kenarı parlar.
- Havalı geçiş animasyonu yok.
- Hedef genişlik 390 px (iPhone). Taşma olmamalı, dokunma alanları en az 44 px.
- Ana ekran ikonunun adı: **TAKİP**.

## 7. Mimari

Statik web uygulaması (PWA), GitHub Pages'te. Derleme adımı yok, tarayıcıda
doğrudan ES modülleri çalışır.

```
takip/
  index.html
  manifest.webmanifest
  sw.js                    — önbellek; her yayında CACHE numarası artar
  css/stil.css
  js/gun.js                — gün anahtarı (04:00), son N günün listesi, tarih yazımı  [saf]
  js/kurallar.js           — tik sayımı, giriş ayrıştırma ve doğrulama, sayı gösterimi  [saf]
  js/kuyruk.js             — bekleyen değişiklikler: ekle, sunucu verisiyle birleştir,
                             gönderilince düş  [saf çekirdek + localStorage sarmalayıcı]
  js/veri.js               — Firebase REST: son 8 günü oku, tek alanı yaz
  js/kimlik.js             — oda/ben değerini # kısmından ya da localStorage'dan oku
  js/ekran.js              — tabloyu çizer, dokunma ve giriş olaylarını yakalar
  js/uygulama.js           — parçaları bağlar, yenileme döngüsü, gün geçişi
  widget/takip-widget.js   — Scriptable betiği, tek dosya
  ikon/                    — ana ekran ikonları
  test/                    — node --test ile çalışan testler
  araclar/                 — oda kurulumu, Firebase denemesi, ikon üretimi, yerel sunucu
  gizli/                   — oda kodları, doldurulmuş kurallar, linkler (.gitignore'da)
```

- `[saf]` işaretli modüller DOM'a ve ağa dokunmaz, Node'da test edilir.
- Manifest'te `start_url` verilmez, böylece ana ekrana eklerken iPhone o anki adresi
  (`#oda=…&ben=…` dahil) kullanır. Bu davranış telefonda doğrulanacak (§13).

## 8. Veri modeli

**Firebase:** Parfüm Tycoon'un Realtime Database'i (proje `chematic-91273`,
`europe-west1`), yeni `takip` düğümü.

```
takip/<ODA_KODU>/<YYYY-MM-DD>/<ali|yagmur> = {
  ders:  true | false,
  spor:  true | false,
  yemek: true | false,
  su:    sayı (0–10),
  uyku:  sayı (0–24)
}
```

- Her alan isteğe bağlıdır. Olmayan alan "girilmedi" demektir.
- Tik kapatılınca `false` yazılır. Su ya da uyku boşaltılınca alan silinir (`null`).

**Test odası:** Gerçek odanın yanında ikinci bir gizli oda kodu (`<TEST_ODA>`) daha
açıktır. Tarayıcı ve Firebase testleri bu odayı kullanır, gerçek odaya dokunmaz.

**Firebase kuralları** (mevcut `oyun` kuralı korunur, `<ODA_KODU>` ve `<TEST_ODA>`
yerine gerçek kodlar yazılır; gerçek kodlar yalnızca konsola girilir, bu belgeye ve
depoya girmez):

```json
{
  "rules": {
    "oyun": { ".read": true, ".write": true },
    "takip": {
      "$oda": {
        ".read": "$oda === '<ODA_KODU>' || $oda === '<TEST_ODA>'",
        "$gun": {
          "$kisi": {
            ".write": "($oda === '<ODA_KODU>' || $oda === '<TEST_ODA>') && ($kisi === 'ali' || $kisi === 'yagmur') && $gun.matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)",
            "ders":   { ".validate": "newData.isBoolean()" },
            "spor":   { ".validate": "newData.isBoolean()" },
            "yemek":  { ".validate": "newData.isBoolean()" },
            "su":     { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10" },
            "uyku":   { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 24" },
            "$diger": { ".validate": false }
          }
        }
      }
    }
  }
}
```

`takip` düğümünün kendisi okunamaz, yani oda kodları listelenemez. Gün biçimi
kontrolü `.write` içindedir, çünkü üst düğümdeki `.validate` alt yola yapılan
yazmalarda çalışmaz.

## 9. Senkron

**Yazma:**
- Her değişiklikte yalnızca değişen alan gönderilir:
  `PATCH takip/<oda>/<gün>/<ben>.json` gövde `{"spor": true}`.
- Herkes yalnızca kendi anahtarına yazdığı için iki kişi birbirini ezemez.
- Aynı kişi iki cihazdan yazarsa, alan bazında son yazan kazanır.

**Okuma:**
- `GET takip/<oda>.json?orderBy="$key"&startAt="<7 gün önce>"` ile bugün + önceki 7 gün
  tek istekte gelir.
- Okuma zamanları: uygulama açılınca, uygulamaya geri dönülünce (`visibilitychange`)
  ve sayfa görünürken 15 saniyede bir.

**Bekleyen değişiklikler (kuyruk):**
- Gönderilemeyen değişiklik `localStorage`'da `{gün: {alan: değer}}` biçiminde tutulur.
- Ekranda her zaman "sunucu verisi + üstüne bekleyenler" gösterilir.
- Bekleyen alanın hücresinde küçük bir "gönderilmedi" işareti olur.
- Her okuma döngüsünde ve `online` olayında kuyruk yeniden gönderilir. Başarılı
  gönderimde alan kuyruktan düşer, ama sadece kuyruktaki değer gönderilen değerle
  hâlâ aynıysa (araya yeni bir değişiklik girdiyse o kalır).
- Uygulama kapatılsa da kuyruk kaybolmaz.

**Telefonda kalanlar:** sadece `oda`, `ben` ve kuyruk. Asıl veri Firebase'dedir.
Ana ekran ikonu silinse bile link yeniden açılınca her şey geri gelir.

## 10. Widget (Scriptable)

- Tek dosya `widget/takip-widget.js`. Üstünde `ODA` ve `BEN` sabitleri var. Depodaki
  kopyada bunlar boştur.
- **Kurulum uygulamanın içinden yapılır:** Bugün ekranının en altında "Widget kurulumu"
  bağlantısı var. Açılan ekranda kurulum adımları ve "Betiği kopyala" düğmesi bulunur.
  Uygulama oda kodunu ve kişiyi zaten bildiği için betiği doldurup panoya kopyalar.
  Kişi Scriptable'da yeni betik açıp yapıştırır. Betik mesajla gönderilmez, çünkü
  mesajlaşma uygulamaları kodu bozabilir. Kopyalama başarısız olursa betik metni
  ekranda seçilebilir bir kutuda gösterilir.
- Firebase'den bugünün verisini REST ile çeker. Gün anahtarı ve tik sayımı
  uygulamadaki kurallarla aynıdır (§5).
- **Küçük boy:** "BUGÜN" etiketi. İki kişi için isim, "n/4" ve ince ilerleme çubuğu.
- **Orta boy:** iki satır. Her satırda isim, dört işaret (ders, spor, yemek, su),
  litre ve uyku saati.
- `BEN` olan kişi hep üstte.
- Renkler uygulamayla aynıdır (§6). Font iPhone'un sistem fontu, rakamlar eşit genişlikte
  (monospaced digit).
- Köşede son güncelleme saati yazar ("14:32").
- `refreshAfterDate` = şimdi + 15 dk. Asıl yenileme zamanına iOS karar verir.
- Dokununca uygulamanın kişisel linki Safari'de açılır. iPhone, widget'tan ana ekran
  web uygulamasını açtırmaz.
- Veri çekilemezse son başarılı veriyi değil, "bağlanamadı" yazısını ve saati gösterir.

## 11. Hata durumları

| Durum | Davranış |
|---|---|
| Geçersiz su/uyku girişi | Alanın altında uyarı, kaydedilmez (§5.3) |
| İnternet yok | Değer ekranda kalır, "gönderilmedi" işareti, kuyrukta bekler (§9) |
| Firebase reddediyor ya da oda yanlış (401/403) | Üstte "Bağlanamadı, linki kontrol et" şeridi |
| Kimlik bilgisi yok | Kurtarma ekranı (§3) |
| Açıkken 04:00 geçildi | Ekran yeni güne geçer (§5.1) |

## 12. Test

- **Otomatik (`node --test`):**
  - `gun.js`: 04:00 sınırı (03:59 / 04:00), ay ve yıl geçişleri, son 7 günün listesi.
  - `kurallar.js`: tik sayımı (su 1,99 / 2 / boş), giriş ayrıştırma ("2,3", "2.3",
    "", "abc", "-1", "10,01", "24"), gösterim ("2,10" → "2,1", "6,0" → "6").
  - `kuyruk.js`: ekle, birleştir (bekleyen sunucuyu ezer), gönderilince düş, araya
    giren değişiklik korunur.
  - Widget betiğinin gün ve tik hesabı, aynı örneklerle.
- **Gerçek Firebase:** test odasıyla yazma ve okuma. Kural testleri: yanlış kişi
  adıyla, yanlış alanla, aralık dışı değerle, yanlış gün biçimiyle ve yanlış oda
  koduyla yazmanın reddedildiği doğrulanır.
- **Görsel:** 390 px genişlikte tarayıcı bölmesinde, test odasıyla açılıp taşma,
  görünüş, iki kişi arası senkron ve internet kesikken kuyruk davranışı kontrol edilir.
- **Telefon:** Ali kendi telefonunda kurar, ekran görüntüsüyle kontrol edilir.
  Scriptable'ın çizim API'si Windows'ta çalışmadığı için widget'ın son görünüşü
  burada doğrulanır.

## 13. Yayın ve teslim

- Depo `temperdkm/takip` (halka açık), site `temperdkm.github.io/takip/`.
- Depoda oda kodu, Firebase kurallarının doldurulmuş hâli ve kişisel widget kopyaları
  bulunmaz.
- Her yayında `sw.js` içindeki `CACHE` numarası artırılır.
- **Teslim sırası:**
  1. Uygulama + Firebase. Ali Firebase kurallarını konsola yapıştırır, telefonda dener,
     düzeltmeleri söyler.
  2. Widget. Ali uygulamadaki "Widget kurulumu" ekranından Scriptable'ı kurar ve ekran
     görüntüsü atar.
  3. Yağmur'a gönderim: kişisel link ve kurulum adımlarını içeren hazır mesaj (betik
     mesajda yok, uygulamadan kopyalanır).
- **Telefonda doğrulanacak:** Ana ekrana eklerken `#oda=…&ben=…` kısmı korunuyor mu?
  Korunmuyorsa kurtarma ekranı devreye girer, kurulum mesajına oda kodu da eklenir.
