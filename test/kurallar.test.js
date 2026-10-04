import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suTikMi, tikSayisi, girisCoz, sayiYaz } from '../js/kurallar.js';

test('su 2 litre ve üstü tik', () => {
  assert.equal(suTikMi(2), true);
  assert.equal(suTikMi(1.99), false);
  assert.equal(suTikMi(undefined), false);
});

test('tik sayısı dört başlık üzerinden', () => {
  assert.equal(tikSayisi(), 0);
  assert.equal(tikSayisi({}), 0);
  assert.equal(tikSayisi({ ders: true, spor: true, yemek: true, su: 2 }), 4);
  assert.equal(tikSayisi({ ders: true, spor: false, su: 1.99, uyku: 9 }), 1);
});

test('giriş: virgül ve nokta', () => {
  assert.deepEqual(girisCoz('su', '2,3'), { tamam: true, deger: 2.3 });
  assert.deepEqual(girisCoz('su', '2.3'), { tamam: true, deger: 2.3 });
  assert.deepEqual(girisCoz('su', ' 10 '), { tamam: true, deger: 10 });
  assert.deepEqual(girisCoz('su', '2,3456'), { tamam: true, deger: 2.35 });
  assert.deepEqual(girisCoz('uyku', '24'), { tamam: true, deger: 24 });
  assert.deepEqual(girisCoz('uyku', ',5'), { tamam: true, deger: 0.5 });
});

test('giriş: boş alan değeri siler', () => {
  assert.deepEqual(girisCoz('su', ''), { tamam: true, deger: null });
  assert.deepEqual(girisCoz('uyku', '   '), { tamam: true, deger: null });
});

test('giriş: geçersiz', () => {
  assert.deepEqual(girisCoz('su', 'abc'), { tamam: false, hata: '0–10 arası yaz' });
  assert.deepEqual(girisCoz('su', '-1'), { tamam: false, hata: '0–10 arası yaz' });
  assert.deepEqual(girisCoz('su', '10,01'), { tamam: false, hata: '0–10 arası yaz' });
  assert.deepEqual(girisCoz('su', '1,2,3'), { tamam: false, hata: '0–10 arası yaz' });
  assert.deepEqual(girisCoz('uyku', '24,5'), { tamam: false, hata: '0–24 arası yaz' });
});

test('sayı gösterimi', () => {
  assert.equal(sayiYaz(2.1), '2,1');
  assert.equal(sayiYaz(6), '6');
  assert.equal(sayiYaz(0), '0');
  assert.equal(sayiYaz(7.25), '7,25');
  assert.equal(sayiYaz(undefined), '—');
});
