// Gerçek Firebase'e karşı uçtan uca deneme. Test odasını kullanır, gerçek odaya dokunmaz.
// Çalıştır: node araclar/firebase-dene.mjs
import { readFileSync } from 'node:fs';
import { oku, yaz, yazmaAdresi, DB_URL, YetkiHatasi } from '../js/veri.js';

const oda = readFileSync(new URL('../gizli/test-oda.txt', import.meta.url), 'utf8').trim();
const YANLIS_ODA = 'yanlisoda000000000000000';
const GUN = '2000-01-01';
let kalan = 0;

function sonuc(ad, tamam, ayrinti = '') {
  console.log(`${tamam ? 'GEÇTİ' : 'KALDI'}  ${ad}${ayrinti ? ` (${ayrinti})` : ''}`);
  if (!tamam) kalan++;
}

async function reddedilmeli(ad, is) {
  try {
    await is();
    sonuc(ad, false, 'kabul edildi');
  } catch (e) {
    sonuc(ad, e instanceof YetkiHatasi, e.constructor.name);
  }
}

await yaz(oda, GUN, 'ali', { ders: true, su: 2.5, uyku: 7 });
await yaz(oda, GUN, 'yagmur', { spor: true });
let veri = await oku(oda, GUN);
sonuc('ali yazıldı', veri[GUN]?.ali?.ders === true && veri[GUN].ali.su === 2.5 && veri[GUN].ali.uyku === 7);
sonuc('yagmur yazıldı', veri[GUN]?.yagmur?.spor === true);

await yaz(oda, GUN, 'ali', { su: null });
veri = await oku(oda, GUN);
sonuc('su silindi, diğerleri kaldı', !('su' in veri[GUN].ali) && veri[GUN].ali.ders === true);

await reddedilmeli('yabancı kişi', () => yaz(oda, GUN, 'mehmet', { ders: true }));
await reddedilmeli('bilinmeyen alan', () => yaz(oda, GUN, 'ali', { x: 1 }));
await reddedilmeli('su 10 üstü', () => yaz(oda, GUN, 'ali', { su: 11 }));
await reddedilmeli('uyku 24 üstü', () => yaz(oda, GUN, 'ali', { uyku: 25 }));
await reddedilmeli('tik yerine metin', () => yaz(oda, GUN, 'ali', { ders: 'evet' }));
await reddedilmeli('yanlış gün biçimi', () => yaz(oda, 'bugun', 'ali', { ders: true }));
await reddedilmeli('yanlış odaya yazma', () => yaz(YANLIS_ODA, GUN, 'ali', { ders: true }));
await reddedilmeli('yanlış odayı okuma', () => oku(YANLIS_ODA, GUN));

const kok = await fetch(`${DB_URL}/takip.json`);
sonuc('takip düğümü listelenemez', kok.status === 401, String(kok.status));

for (const kisi of ['ali', 'yagmur']) await fetch(yazmaAdresi(oda, GUN, kisi), { method: 'DELETE' });
veri = await oku(oda, GUN);
sonuc('deneme verisi temizlendi', !veri[GUN]);

console.log(kalan ? `${kalan} deneme kaldı` : 'Hepsi geçti');
process.exitCode = kalan ? 1 : 0;
