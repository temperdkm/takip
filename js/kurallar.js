// Tik sayımı, giriş ayrıştırma ve sayı gösterimi.
export const SU_HEDEF = 2;
const SINIRLAR = { su: { min: 0, max: 10 }, uyku: { min: 0, max: 24 } };
const SAYI_DESENI = /^(\d+\.?\d*|\.\d+)$/;

export function suTikMi(su) {
  return typeof su === 'number' && su >= SU_HEDEF;
}

// Tiklenebilir dört başlık: ders, spor, yemek, su (≥ 2 L). Uyku sayılmaz.
export function tikSayisi(kayit = {}) {
  const tikler = [kayit.ders, kayit.spor, kayit.yemek].filter((v) => v === true).length;
  return tikler + (suTikMi(kayit.su) ? 1 : 0);
}

// Döner: { tamam: true, deger: sayı | null }  (null = alan boşaltıldı, değer silinecek)
//        { tamam: false, hata: '0–10 arası yaz' }
export function girisCoz(alan, metin) {
  const { min, max } = SINIRLAR[alan];
  const hata = `${min}–${max} arası yaz`;
  const temiz = String(metin).trim().replace(',', '.');
  if (temiz === '') return { tamam: true, deger: null };
  if (!SAYI_DESENI.test(temiz)) return { tamam: false, hata };
  const sayi = Math.round(Number(temiz) * 100) / 100;
  if (sayi < min || sayi > max) return { tamam: false, hata };
  return { tamam: true, deger: sayi };
}

export function sayiYaz(deger) {
  if (typeof deger !== 'number') return '—';
  return String(Math.round(deger * 100) / 100).replace('.', ',');
}
