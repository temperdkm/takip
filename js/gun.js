// Gün hesapları. Gün gece 04:00'te değişir.
const SINIR_SAAT = 4;
const GUNLER = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];
const KISA_GUNLER = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];
const AYLAR = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];

const iki = (n) => String(n).padStart(2, '0');

function anahtarYap(tarih) {
  return `${tarih.getFullYear()}-${iki(tarih.getMonth() + 1)}-${iki(tarih.getDate())}`;
}

// 'YYYY-MM-DD' → o günün yerel öğleni (saat kaymalarından etkilenmesin diye öğlen)
function anahtarCoz(anahtar) {
  const [yil, ay, gun] = anahtar.split('-').map(Number);
  return new Date(yil, ay - 1, gun, 12);
}

export function gunAnahtari(simdi = new Date()) {
  const d = new Date(simdi.getTime());
  d.setHours(d.getHours() - SINIR_SAAT);
  return anahtarYap(d);
}

export function gunKaydir(anahtar, fark) {
  const d = anahtarCoz(anahtar);
  d.setDate(d.getDate() + fark);
  return anahtarYap(d);
}

export function oncekiGunler(anahtar, adet) {
  return Array.from({ length: adet }, (_, i) => gunKaydir(anahtar, -(i + 1)));
}

export function tarihYazisi(anahtar) {
  const d = anahtarCoz(anahtar);
  return `${GUNLER[d.getDay()]} ${d.getDate()} ${AYLAR[d.getMonth()]}`;
}

export function kisaTarih(anahtar) {
  const d = anahtarCoz(anahtar);
  return `${KISA_GUNLER[d.getDay()]} ${d.getDate()} ${AYLAR[d.getMonth()]}`;
}

// Bugün ve önceki 7 gün düzenlenebilir.
export function duzenlenebilirMi(anahtar, bugun) {
  return anahtar <= bugun && anahtar >= gunKaydir(bugun, -7);
}
