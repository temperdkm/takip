// Kim olduğunu ve oda kodunu bulur: önce linkin # kısmı, sonra telefondaki kayıt.
export const KISILER = { ali: 'ALİ', yagmur: 'YAĞMUR' };
const ANAHTAR = 'takip.kimlik';
const ODA_DESENI = /^[a-z0-9]{24}$/;

export function gecerliMi(k) {
  return Boolean(k) && ODA_DESENI.test(k.oda || '') && Object.hasOwn(KISILER, k.ben || '');
}

// '#oda=...&ben=ali' → { oda, ben } | null
export function hashCoz(hash) {
  const p = new URLSearchParams(String(hash).replace(/^#/, ''));
  const k = { oda: p.get('oda'), ben: p.get('ben') };
  return gecerliMi(k) ? k : null;
}

export function kimlikKaydet(k, depo) {
  try {
    depo.setItem(ANAHTAR, JSON.stringify({ oda: k.oda, ben: k.ben }));
  } catch {
    // depolama kapalıysa her açılışta link gerekir
  }
}

export function kimlikBul(hash, depo) {
  const linkten = hashCoz(hash);
  if (linkten) {
    kimlikKaydet(linkten, depo);
    return linkten;
  }
  try {
    const k = JSON.parse(depo.getItem(ANAHTAR));
    return gecerliMi(k) ? { oda: k.oda, ben: k.ben } : null;
  } catch {
    return null;
  }
}

// Kurtarma ekranındaki kutu: tam link yapıştırıldıysa ondan, değilse kod + seçilen kişi.
export function girdiCoz(metin, secili) {
  const temiz = String(metin).trim();
  const diyez = temiz.indexOf('#');
  if (diyez >= 0) return hashCoz(temiz.slice(diyez));
  const k = { oda: temiz.toLowerCase(), ben: secili };
  return gecerliMi(k) ? k : null;
}

export function karsiTaraf(ben) {
  return ben === 'ali' ? 'yagmur' : 'ali';
}

export function linkYap(taban, k) {
  return `${taban}#oda=${k.oda}&ben=${k.ben}`;
}

// Widget betiğindeki boş ODA ve BEN satırlarını doldurur.
export function widgetKisisellestir(metin, k) {
  return metin
    .replace("const ODA = '';", `const ODA = '${k.oda}';`)
    .replace("const BEN = '';", `const BEN = '${k.ben}';`);
}
