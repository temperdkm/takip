// TAKİP widget'ı (Scriptable).
// Uygulamadaki "Widget kurulumu" ekranı bu dosyayı ODA ve BEN doldurulmuş olarak kopyalar.
const ODA = '';
const BEN = '';
const SITE = 'https://temperdkm.github.io/takip/';
const DB_URL = 'https://chematic-91273-default-rtdb.europe-west1.firebasedatabase.app';

const KISILER = { ali: 'ALİ', yagmur: 'YAĞMUR' };
const RENK = {
  zemin: '#0C0F13', cizgi: '#1E242C', baslik: '#EEF1F5', govde: '#C9CED6',
  ikincil: '#6B7380', bos: '#3A424D', olcu: '#6FB4FF', uyari: '#E8A15A',
};

const iki = (n) => String(n).padStart(2, '0');

// Gün 04:00'te değişir (uygulamadaki js/gun.js ile aynı kural).
function gunAnahtari(simdi) {
  const d = new Date(simdi.getTime());
  d.setHours(d.getHours() - 4);
  return `${d.getFullYear()}-${iki(d.getMonth() + 1)}-${iki(d.getDate())}`;
}

function suTikMi(su) {
  return typeof su === 'number' && su >= 2;
}

function tikSayisi(kayit = {}) {
  const tikler = [kayit.ders, kayit.spor, kayit.yemek].filter((v) => v === true).length;
  return tikler + (suTikMi(kayit.su) ? 1 : 0);
}

function sayiYaz(deger) {
  if (typeof deger !== 'number') return '—';
  return String(Math.round(deger * 100) / 100).replace('.', ',');
}

function olcuYaz(deger, birim) {
  return typeof deger === 'number' ? `${sayiYaz(deger)} ${birim}` : '—';
}

function saatYaz(simdi) {
  return `${iki(simdi.getHours())}:${iki(simdi.getMinutes())}`;
}

function siraliKisiler(ben) {
  return ben === 'yagmur' ? ['yagmur', 'ali'] : ['ali', 'yagmur'];
}

// --- Scriptable ---

const renk = (ad) => new Color(RENK[ad]);

function yazi(yer, metin, boyut, renkAdi, rakam = false) {
  const t = yer.addText(metin);
  t.font = rakam ? Font.mediumMonospacedSystemFont(boyut) : Font.mediumSystemFont(boyut);
  t.textColor = renk(renkAdi);
  t.lineLimit = 1;
  return t;
}

async function veriCek(gun) {
  const istek = new Request(`${DB_URL}/takip/${ODA}/${gun}.json`);
  istek.timeoutInterval = 10;
  const json = await istek.loadJSON();
  if (istek.response.statusCode !== 200) throw new Error(String(istek.response.statusCode));
  return json || {};
}

function cubuk(yer, n) {
  const GENISLIK = 118;
  const c = yer.addStack();
  c.size = new Size(GENISLIK, 3);
  c.backgroundColor = renk('cizgi');
  if (n > 0) {
    const dolu = c.addStack();
    dolu.size = new Size((GENISLIK * n) / 4, 3);
    dolu.backgroundColor = renk('baslik');
  }
  c.addSpacer();
}

function kucukCiz(w, veri, kisiler) {
  yazi(w, 'BUGÜN', 11, 'ikincil');
  w.addSpacer(10);
  for (const k of kisiler) {
    const n = tikSayisi(veri[k]);
    const satir = w.addStack();
    satir.centerAlignContent();
    yazi(satir, KISILER[k], 13, 'govde');
    satir.addSpacer();
    yazi(satir, `${n}/4`, 13, 'baslik', true);
    w.addSpacer(5);
    cubuk(w, n);
    w.addSpacer(12);
  }
}

function isaret(yer, tikli) {
  const kutu = yer.addStack();
  kutu.size = new Size(22, 18);
  kutu.centerAlignContent();
  if (tikli) {
    const sembol = SFSymbol.named('checkmark');
    sembol.applyFont(Font.semiboldSystemFont(12));
    const resim = kutu.addImage(sembol.image);
    resim.tintColor = renk('baslik');
    resim.imageSize = new Size(13, 13);
  } else {
    yazi(kutu, '—', 12, 'bos');
  }
}

function ortaCiz(w, veri, kisiler) {
  const bas = w.addStack();
  bas.centerAlignContent();
  const etiket = bas.addStack();
  etiket.size = new Size(64, 0);
  yazi(etiket, 'BUGÜN', 11, 'ikincil');
  etiket.addSpacer();
  for (const harf of ['D', 'S', 'Y', 'SU']) {
    const kutu = bas.addStack();
    kutu.size = new Size(22, 14);
    kutu.centerAlignContent();
    yazi(kutu, harf, 9, 'ikincil');
  }
  bas.addSpacer();
  w.addSpacer(8);
  for (const k of kisiler) {
    const kayit = veri[k] || {};
    const satir = w.addStack();
    satir.centerAlignContent();
    const ad = satir.addStack();
    ad.size = new Size(64, 0);
    yazi(ad, KISILER[k], 14, 'govde');
    ad.addSpacer();
    for (const alan of ['ders', 'spor', 'yemek']) isaret(satir, kayit[alan] === true);
    isaret(satir, suTikMi(kayit.su));
    satir.addSpacer();
    yazi(satir, olcuYaz(kayit.su, 'L'), 13, suTikMi(kayit.su) ? 'olcu' : 'ikincil', true);
    satir.addSpacer(10);
    yazi(satir, olcuYaz(kayit.uyku, 'sa'), 13, typeof kayit.uyku === 'number' ? 'olcu' : 'bos', true);
    w.addSpacer(10);
  }
}

async function calistir() {
  const simdi = new Date();
  const boyut = config.widgetFamily || 'medium';
  const w = new ListWidget();
  w.backgroundColor = renk('zemin');
  w.setPadding(14, 16, 10, 16);
  w.refreshAfterDate = new Date(simdi.getTime() + 15 * 60 * 1000);
  const ayarli = Boolean(ODA) && Boolean(KISILER[BEN]);
  if (ayarli) w.url = `${SITE}#oda=${ODA}&ben=${BEN}`;
  try {
    if (!ayarli) throw new Error('ayar');
    const veri = await veriCek(gunAnahtari(simdi));
    if (boyut === 'small') kucukCiz(w, veri, siraliKisiler(BEN));
    else ortaCiz(w, veri, siraliKisiler(BEN));
  } catch (e) {
    yazi(w, 'BUGÜN', 11, 'ikincil');
    w.addSpacer(8);
    yazi(w, e.message === 'ayar' ? 'ODA ve BEN boş' : 'bağlanamadı', 14, 'uyari');
  }
  w.addSpacer();
  const alt = w.addStack();
  alt.addSpacer();
  yazi(alt, saatYaz(simdi), 10, 'bos', true);
  if (config.runsInWidget) Script.setWidget(w);
  else if (boyut === 'small') await w.presentSmall();
  else await w.presentMedium();
  Script.complete();
}

await calistir();
