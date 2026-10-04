// Ekranların HTML'ini üretir. DOM'a yalnızca olaylariBagla dokunur.
import { tarihYazisi, kisaTarih, oncekiGunler } from './gun.js';
import { tikSayisi, suTikMi, sayiYaz } from './kurallar.js';
import { KISILER, karsiTaraf } from './kimlik.js';
import { bekliyorMu } from './kuyruk.js';

const SATIRLAR = [
  { alan: 'ders', ad: 'Ders', tur: 'tik' },
  { alan: 'spor', ad: 'Spor', tur: 'tik' },
  { alan: 'yemek', ad: 'Yemek', tur: 'tik' },
  { alan: 'su', ad: 'Su', tur: 'sayi', birim: 'L' },
  { alan: 'uyku', ad: 'Uyku', tur: 'sayi', birim: 'sa' },
];

const TIK = '<svg class="tik" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const BOS = '<span class="bos">—</span>';

export function kacis(metin) {
  const tablo = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(metin).replace(/[&<>"']/g, (h) => tablo[h]);
}

function olcuHtml(alan, deger) {
  if (typeof deger !== 'number') return BOS;
  const sinif = alan === 'su' && !suTikMi(deger) ? 'olcu-eksik' : 'olcu';
  return `<span class="${sinif}">${sayiYaz(deger)}</span>`;
}

function hucreHtml(d, satir, kisi, kayit) {
  const benim = kisi === d.ben;
  const isaret = benim && d.gonderilemedi && bekliyorMu(d.kuyruk, d.gun, satir.alan)
    ? '<span class="bekliyor" aria-label="gönderilmedi"></span>'
    : '';
  if (satir.tur === 'tik') {
    const tikli = kayit[satir.alan] === true;
    const ic = tikli ? TIK : BOS;
    if (!benim) return `<span class="hucre">${ic}</span>`;
    return `<button class="hucre dokun" data-islem="tik" data-alan="${satir.alan}" aria-label="${satir.ad}" aria-pressed="${tikli}">${ic}${isaret}</button>`;
  }
  const deger = kayit[satir.alan];
  if (benim && d.duzenlenen === satir.alan) {
    const metin = typeof deger === 'number' ? sayiYaz(deger) : '';
    return `<span class="hucre secili"><input class="sayi-alani" data-alan="${satir.alan}" inputmode="decimal" enterkeyhint="done" autocomplete="off" aria-label="${satir.ad}" value="${kacis(metin)}"></span>`;
  }
  const ic = olcuHtml(satir.alan, deger);
  if (!benim) return `<span class="hucre">${ic}</span>`;
  return `<button class="hucre dokun" data-islem="sayi" data-alan="${satir.alan}" aria-label="${satir.ad}">${ic}${isaret}</button>`;
}

function tabloHtml(d) {
  const kisiler = [d.ben, karsiTaraf(d.ben)];
  const gunVeri = d.veri[d.gun] || {};
  const bas = `<div class="satir bas"><span></span>${kisiler.map((k) => `<span class="hucre">${KISILER[k]}</span>`).join('')}</div>`;
  const govde = SATIRLAR.map((s) => {
    const birim = s.birim ? ` <span class="birim">${s.birim}</span>` : '';
    const hucreler = kisiler.map((k) => hucreHtml(d, s, k, gunVeri[k] || {})).join('');
    const hata = d.hata && d.hata.alan === s.alan
      ? `<div class="hata-satir">${kacis(d.hata.mesaj)}, kaydedilmedi</div>`
      : '';
    return `<div class="satir"><span class="etiket">${s.ad}${birim}</span>${hucreler}</div>${hata}`;
  }).join('');
  return `<section class="tablo">${bas}${govde}</section>`;
}

function gecmisHtml(d) {
  const kisiler = [d.ben, karsiTaraf(d.ben)];
  const satirlar = oncekiGunler(d.bugun, 7).map((g) => {
    const gunVeri = d.veri[g] || {};
    const hucreler = kisiler.map((k) => {
      const kayit = gunVeri[k] || {};
      return `<span class="hucre"><span class="sayac">${tikSayisi(kayit)}/4</span>${olcuHtml('uyku', kayit.uyku)}</span>`;
    }).join('');
    return `<div class="satir gecmis" role="button" tabindex="0" data-islem="gun" data-gun="${g}"><span class="etiket">${kisaTarih(g)}</span>${hucreler}</div>`;
  }).join('');
  return `<section class="gecmis-liste"><h2>Son 7 gün</h2>${satirlar}</section>`;
}

export function sayfaHtml(d) {
  const bugunMu = d.gun === d.bugun;
  const serit = d.baglanti === 'yetki' ? '<div class="serit">Bağlanamadı, linki kontrol et</div>' : '';
  const geri = bugunMu ? '' : '<button class="geri" data-islem="geri">‹ Bugün</button>';
  const baslik = `<header class="ust">${geri}<div class="tarih">${tarihYazisi(d.gun)}</div><h1>${bugunMu ? 'Bugün' : 'Geçmiş gün'}</h1></header>`;
  return `${serit}${baslik}${tabloHtml(d)}${bugunMu ? gecmisHtml(d) : ''}`;
}

export function kurtarmaHtml(secili, metin, hata) {
  const kisiler = Object.entries(KISILER)
    .map(([k, ad]) => `<button class="kisi${secili === k ? ' secili' : ''}" data-islem="kisi" data-kisi="${k}">${ad}</button>`)
    .join('');
  const hataHtml = hata ? `<div class="hata-satir">${kacis(hata)}</div>` : '';
  return `<header class="ust"><div class="tarih">TAKİP</div><h1>Sen kimsin?</h1></header>`
    + `<div class="secim">${kisiler}</div>`
    + '<label class="etiket-ust" for="oda">Oda kodu ya da sana gelen link</label>'
    + `<input id="oda" class="metin-alani" autocomplete="off" autocapitalize="off" spellcheck="false" value="${kacis(metin || '')}">`
    + hataHtml
    + '<button class="ana-dugme" data-islem="basla">Başla</button>';
}

export function olaylariBagla(kok, islem) {
  kok.addEventListener('click', (e) => {
    const hedef = e.target.closest('[data-islem]');
    if (hedef) islem(hedef.dataset.islem, { ...hedef.dataset });
  });
  kok.addEventListener('focusout', (e) => {
    if (e.target.matches('.sayi-alani')) islem('sayiBitti', { alan: e.target.dataset.alan, metin: e.target.value });
  });
  kok.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('.sayi-alani')) e.target.blur();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-islem]')) {
      e.preventDefault();
      e.target.click();
    }
  });
}
