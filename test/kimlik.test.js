import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KISILER, hashCoz, kimlikBul, girdiCoz, karsiTaraf, linkYap } from '../js/kimlik.js';

const ODA = 'abcdefghijklmnopqrstuvwx'; // 24 karakter

function sahteDepo(baslangic = {}) {
  const v = { ...baslangic };
  return { getItem: (a) => (a in v ? v[a] : null), setItem: (a, d) => { v[a] = String(d); } };
}

test('linkten oda ve kişi okunur', () => {
  assert.deepEqual(hashCoz(`#oda=${ODA}&ben=ali`), { oda: ODA, ben: 'ali' });
  assert.equal(hashCoz(`#oda=${ODA}&ben=mehmet`), null);
  assert.equal(hashCoz('#oda=kisa&ben=ali'), null);
  assert.equal(hashCoz(''), null);
});

test('kimlikBul: link öncelikli ve telefona yazılır', () => {
  const depo = sahteDepo();
  assert.deepEqual(kimlikBul(`#oda=${ODA}&ben=yagmur`, depo), { oda: ODA, ben: 'yagmur' });
  assert.deepEqual(kimlikBul('', depo), { oda: ODA, ben: 'yagmur' });
});

test('kimlikBul: hiçbir yerde yoksa null', () => {
  assert.equal(kimlikBul('', sahteDepo()), null);
  assert.equal(kimlikBul('', sahteDepo({ 'takip.kimlik': '{bozuk' })), null);
});

test('girdiCoz: tam link ya da sadece kod', () => {
  assert.deepEqual(girdiCoz(`https://temperdkm.github.io/takip/#oda=${ODA}&ben=ali`, null), { oda: ODA, ben: 'ali' });
  assert.deepEqual(girdiCoz(` ${ODA.toUpperCase()} `, 'yagmur'), { oda: ODA, ben: 'yagmur' });
  assert.equal(girdiCoz(ODA, null), null);
  assert.equal(girdiCoz('kisa', 'ali'), null);
});

test('karşı taraf ve isimler', () => {
  assert.equal(karsiTaraf('ali'), 'yagmur');
  assert.equal(karsiTaraf('yagmur'), 'ali');
  assert.deepEqual(KISILER, { ali: 'ALİ', yagmur: 'YAĞMUR' });
});

test('link yapımı', () => {
  assert.equal(
    linkYap('https://temperdkm.github.io/takip/', { oda: ODA, ben: 'ali' }),
    `https://temperdkm.github.io/takip/#oda=${ODA}&ben=ali`,
  );
});
