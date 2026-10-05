// Uygulamanın beyni: durumu tutar, ekranı çizer, Firebase ile konuşur.
import { gunAnahtari, gunKaydir, duzenlenebilirMi } from './gun.js';
import { girisCoz } from './kurallar.js';
import { ekle, dus, birlestir, kuyrukOku, kuyrukYaz } from './kuyruk.js';
import { oku, yaz, YetkiHatasi } from './veri.js';
import { kimlikBul, kimlikKaydet, girdiCoz, widgetKisisellestir } from './kimlik.js';
import { sayfaHtml, kurtarmaHtml, widgetHtml, olaylariBagla } from './ekran.js';

const YENILEME_MS = 15000;
const kok = document.getElementById('uygulama');

const durum = {
  kimlik: kimlikBul(location.hash, localStorage),
  bugun: gunAnahtari(),
  veri: {},
  kuyruk: kuyrukOku(localStorage),
  acikGun: null,
  duzenlenen: null,
  hata: null,
  baglanti: 'tamam',
  gonderilemedi: false,
  widget: null, // { durumu, betik } — widget kurulum ekranı açıkken
  kurtarmaSecili: null,
  kurtarmaMetin: '',
  kurtarmaHata: null,
};

let sonHtml = '';
let yazmaSurumu = 0; // her başarılı yazmada artar; eski okuma yanıtlarını ayıklamak için
let gonderiliyor = false;
let tekrarGonder = false;
let basladi = false;

const gosterilenGun = () => durum.acikGun || durum.bugun;
const birlesik = () => birlestir(durum.veri, durum.kuyruk, durum.kimlik.ben);
const benimKayit = (gun) => birlesik()[gun]?.[durum.kimlik.ben] || {};

function sayfa() {
  if (!durum.kimlik) return kurtarmaHtml(durum.kurtarmaSecili, durum.kurtarmaMetin, durum.kurtarmaHata);
  if (durum.widget) return widgetHtml(durum.widget.durumu, durum.widget.betik);
  return sayfaHtml({
    ben: durum.kimlik.ben,
    gun: gosterilenGun(),
    bugun: durum.bugun,
    veri: birlesik(),
    kuyruk: durum.kuyruk,
    duzenlenen: durum.duzenlenen,
    hata: durum.hata,
    baglanti: durum.baglanti,
    gonderilemedi: durum.gonderilemedi,
  });
}

function ciz() {
  const html = sayfa();
  if (html === sonHtml) return;
  kok.innerHTML = html;
  sonHtml = html;
  const alan = kok.querySelector('.sayi-alani');
  if (alan) {
    alan.focus();
    alan.select();
  }
}

async function gonder() {
  if (gonderiliyor) {
    tekrarGonder = true;
    return;
  }
  gonderiliyor = true;
  tekrarGonder = false;
  let basarili = true;
  try {
    for (const [gun, alanlar] of Object.entries(durum.kuyruk)) {
      const paket = { ...alanlar };
      await yaz(durum.kimlik.oda, gun, durum.kimlik.ben, paket);
      yazmaSurumu++;
      durum.veri = birlestir(durum.veri, { [gun]: paket }, durum.kimlik.ben);
      durum.kuyruk = dus(durum.kuyruk, gun, paket);
      kuyrukYaz(durum.kuyruk, localStorage);
    }
    durum.gonderilemedi = false;
    durum.baglanti = 'tamam';
  } catch (e) {
    basarili = false;
    durum.gonderilemedi = true;
    if (e instanceof YetkiHatasi) durum.baglanti = 'yetki';
  } finally {
    gonderiliyor = false;
  }
  if (basarili && tekrarGonder) return gonder();
  if (!durum.duzenlenen) ciz();
}

async function yenile() {
  durum.bugun = gunAnahtari();
  if (durum.acikGun && !duzenlenebilirMi(durum.acikGun, durum.bugun)) durum.acikGun = null;
  const surum = yazmaSurumu;
  try {
    const veri = await oku(durum.kimlik.oda, gunKaydir(durum.bugun, -7));
    if (surum === yazmaSurumu) durum.veri = veri; // arada yazma olduysa bu yanıt eskidir
    durum.baglanti = 'tamam';
  } catch (e) {
    if (e instanceof YetkiHatasi) durum.baglanti = 'yetki';
  }
  if (Object.keys(durum.kuyruk).length) gonder();
  if (!durum.duzenlenen) ciz();
}

function kuyrugaEkle(gun, alan, deger) {
  durum.kuyruk = ekle(durum.kuyruk, gun, alan, deger);
  kuyrukYaz(durum.kuyruk, localStorage);
  gonder();
}

function widgetDurumu(durumu, betik) {
  if (!durum.widget) return; // kullanıcı bu arada geri döndüyse dokunma
  durum.widget = { durumu, betik: betik ?? durum.widget.betik };
  ciz();
}

function islem(ad, v) {
  if (ad !== 'sayiBitti' && ad !== 'kisi') durum.hata = null;
  switch (ad) {
    case 'kisi':
      durum.kurtarmaMetin = document.getElementById('oda')?.value ?? '';
      durum.kurtarmaSecili = v.kisi;
      return ciz();
    case 'basla': {
      const metin = document.getElementById('oda')?.value ?? '';
      const k = girdiCoz(metin, durum.kurtarmaSecili);
      if (!k) {
        durum.kurtarmaMetin = metin;
        durum.kurtarmaHata = 'Kişi ya da oda kodu eksik';
        return ciz();
      }
      kimlikKaydet(k, localStorage);
      durum.kimlik = k;
      return baslat();
    }
    case 'tik': {
      const gun = gosterilenGun();
      kuyrugaEkle(gun, v.alan, benimKayit(gun)[v.alan] !== true);
      return ciz();
    }
    case 'sayi':
      durum.duzenlenen = v.alan;
      return ciz();
    case 'sayiBitti': {
      if (durum.duzenlenen !== v.alan) return;
      durum.duzenlenen = null;
      const sonuc = girisCoz(v.alan, v.metin);
      if (!sonuc.tamam) {
        durum.hata = { alan: v.alan, mesaj: sonuc.hata };
        return ciz();
      }
      durum.hata = null;
      const gun = gosterilenGun();
      if (sonuc.deger !== (benimKayit(gun)[v.alan] ?? null)) kuyrugaEkle(gun, v.alan, sonuc.deger);
      return ciz();
    }
    case 'gun':
      durum.acikGun = v.gun;
      durum.duzenlenen = null;
      ciz();
      return window.scrollTo(0, 0);
    case 'geri':
      durum.acikGun = null;
      durum.widget = null;
      return ciz();
    case 'widget':
      durum.widget = { durumu: 'yukleniyor', betik: '' };
      ciz();
      window.scrollTo(0, 0);
      fetch('widget/takip-widget.js')
        .then((y) => {
          if (!y.ok) throw new Error(String(y.status));
          return y.text();
        })
        .then((metin) => widgetDurumu('hazir', widgetKisisellestir(metin, durum.kimlik)))
        .catch(() => widgetDurumu('yuklenemedi', ''));
      return undefined;
    case 'kopyala':
      // Panoya yazma dokunuşun içinde, beklemeden yapılmalı (Safari kuralı); betik önceden yüklendi.
      if (!durum.widget?.betik) return undefined;
      try {
        navigator.clipboard.writeText(durum.widget.betik).then(
          () => widgetDurumu('kopyalandi'),
          () => widgetDurumu('kopyalanamadi'),
        );
      } catch {
        widgetDurumu('kopyalanamadi');
      }
      return undefined;
    default:
      return undefined;
  }
}

function baslat() {
  ciz();
  if (!durum.kimlik || basladi) return;
  basladi = true;
  yenile();
  setInterval(() => {
    if (document.visibilityState === 'visible') yenile();
  }, YENILEME_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') yenile();
  });
  window.addEventListener('online', () => gonder());
}

// Sayfa açıkken başka bir kişisel link açılırsa (# değişir, sayfa yüklenmez) baştan başla.
window.addEventListener('hashchange', () => {
  const k = kimlikBul(location.hash, localStorage);
  if (k && (k.oda !== durum.kimlik?.oda || k.ben !== durum.kimlik?.ben)) location.reload();
});

olaylariBagla(kok, islem);
baslat();

// Yerelde önbellek karışıklığı olmasın diye service worker yalnızca yayındaki sitede.
if ('serviceWorker' in navigator && location.hostname.endsWith('github.io')) {
  navigator.serviceWorker.register('sw.js');
}
