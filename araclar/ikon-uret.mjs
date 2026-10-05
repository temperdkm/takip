// Ana ekran ikonlarını bağımlılıksız üretir: kömür zemin, açık renk tik, altında ölçü mavisi çizgi.
// Çalıştır: node araclar/ikon-uret.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';

const ZEMIN = [0x0c, 0x0f, 0x13];
const TIK = [0xee, 0xf1, 0xf5];
const OLCU = [0x6f, 0xb4, 0xff];

function parcaUzaklik(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

const karistir = (a, b, oran) => a.map((v, i) => Math.round(v + (b[i] - v) * oran));
const kaplama = (uzaklik, yaricap, piksel) => Math.max(0, Math.min(1, (yaricap - uzaklik) / piksel + 0.5));

function pikseller(boyut) {
  const satirlar = [];
  for (let y = 0; y < boyut; y++) {
    const satir = Buffer.alloc(1 + boyut * 3); // ilk bayt: PNG filtre türü 0
    for (let x = 0; x < boyut; x++) {
      const u = (x + 0.5) / boyut;
      const v = (y + 0.5) / boyut;
      const piksel = 1 / boyut;
      const tik = Math.min(parcaUzaklik(u, v, 0.27, 0.5, 0.43, 0.66), parcaUzaklik(u, v, 0.43, 0.66, 0.74, 0.34));
      let renk = karistir(ZEMIN, TIK, kaplama(tik, 0.055, piksel));
      renk = karistir(renk, OLCU, kaplama(parcaUzaklik(u, v, 0.27, 0.8, 0.74, 0.8), 0.018, piksel));
      satir.set(renk, 1 + x * 3);
    }
    satirlar.push(satir);
  }
  return Buffer.concat(satirlar);
}

function parca(tur, veri) {
  const uzunluk = Buffer.alloc(4);
  uzunluk.writeUInt32BE(veri.length);
  const govde = Buffer.concat([Buffer.from(tur, 'ascii'), veri]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(govde));
  return Buffer.concat([uzunluk, govde, crc]);
}

function png(boyut) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(boyut, 0);
  ihdr.writeUInt32BE(boyut, 4);
  ihdr[8] = 8; // bit derinliği
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    parca('IHDR', ihdr),
    parca('IDAT', deflateSync(pikseller(boyut))),
    parca('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL('../ikon/', import.meta.url), { recursive: true });
for (const boyut of [180, 192, 512]) {
  writeFileSync(new URL(`../ikon/ikon-${boyut}.png`, import.meta.url), png(boyut));
}
console.log('ikon/ikon-180.png, ikon-192.png, ikon-512.png yazıldı');
