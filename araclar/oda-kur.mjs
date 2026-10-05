// Bir kere çalışır: gerçek oda ve test odası kodlarını üretir, doldurulmuş Firebase
// kurallarını ve kişisel linkleri gizli/ klasörüne yazar. Tekrar çalışırsa mevcut
// kodları korur. gizli/ asla commit edilmez.
import { randomInt } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { linkYap } from '../js/kimlik.js';

const SITE = 'https://temperdkm.github.io/takip/';
const KLASOR = new URL('../gizli/', import.meta.url);
mkdirSync(KLASOR, { recursive: true });

function kodAl(dosyaAdi) {
  const dosya = new URL(dosyaAdi, KLASOR);
  if (existsSync(dosya)) return readFileSync(dosya, 'utf8').trim();
  const harfler = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const kod = Array.from({ length: 24 }, () => harfler[randomInt(harfler.length)]).join('');
  writeFileSync(dosya, `${kod}\n`);
  return kod;
}

const oda = kodAl('oda.txt');
const testOda = kodAl('test-oda.txt');
const odaKosulu = `$oda === '${oda}' || $oda === '${testOda}'`;

const kurallar = {
  rules: {
    oyun: { '.read': true, '.write': true },
    takip: {
      $oda: {
        '.read': odaKosulu,
        $gun: {
          $kisi: {
            '.write': `(${odaKosulu}) && ($kisi === 'ali' || $kisi === 'yagmur') && $gun.matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)`,
            ders: { '.validate': 'newData.isBoolean()' },
            spor: { '.validate': 'newData.isBoolean()' },
            yemek: { '.validate': 'newData.isBoolean()' },
            su: { '.validate': 'newData.isNumber() && newData.val() >= 0 && newData.val() <= 10' },
            uyku: { '.validate': 'newData.isNumber() && newData.val() >= 0 && newData.val() <= 24' },
            $diger: { '.validate': false },
          },
        },
      },
    },
  },
};

writeFileSync(new URL('kurallar.json', KLASOR), `${JSON.stringify(kurallar, null, 2)}\n`);
writeFileSync(
  new URL('linkler.txt', KLASOR),
  [
    `ALİ:         ${linkYap(SITE, { oda, ben: 'ali' })}`,
    `YAĞMUR:      ${linkYap(SITE, { oda, ben: 'yagmur' })}`,
    `TEST (ali):  ${linkYap(SITE, { oda: testOda, ben: 'ali' })}`,
    '',
  ].join('\n'),
);
console.log('gizli/ klasörüne yazıldı: oda.txt, test-oda.txt, kurallar.json, linkler.txt');
