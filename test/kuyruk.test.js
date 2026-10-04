import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ekle, dus, birlestir, bekliyorMu, kuyrukOku, kuyrukYaz } from '../js/kuyruk.js';

test('ekle eskisini değiştirmez', () => {
  const k0 = {};
  const k1 = ekle(k0, '2026-10-04', 'spor', true);
  assert.deepEqual(k0, {});
  assert.deepEqual(k1, { '2026-10-04': { spor: true } });
  assert.deepEqual(ekle(k1, '2026-10-04', 'su', 2.5), { '2026-10-04': { spor: true, su: 2.5 } });
});

test('dus: gönderilen değer hâlâ aynıysa düşer', () => {
  const k = { '2026-10-04': { spor: true, su: 2.5 } };
  assert.deepEqual(dus(k, '2026-10-04', { spor: true }), { '2026-10-04': { su: 2.5 } });
  assert.deepEqual(dus(k, '2026-10-04', { spor: true, su: 2.5 }), {});
});

test('dus: araya giren değişiklik korunur', () => {
  const k = { '2026-10-04': { su: 3 } };
  assert.deepEqual(dus(k, '2026-10-04', { su: 2.5 }), { '2026-10-04': { su: 3 } });
});

test('dus: silme (null) da eşleşir', () => {
  assert.deepEqual(dus({ '2026-10-04': { su: null } }, '2026-10-04', { su: null }), {});
});

test('birlestir: bekleyen sunucuyu ezer, karşı tarafa dokunmaz', () => {
  const sunucu = { '2026-10-04': { ali: { spor: false, su: 1 }, yagmur: { ders: true } } };
  const kuyruk = { '2026-10-04': { spor: true, su: null }, '2026-10-03': { uyku: 7 } };
  assert.deepEqual(birlestir(sunucu, kuyruk, 'ali'), {
    '2026-10-04': { ali: { spor: true }, yagmur: { ders: true } },
    '2026-10-03': { ali: { uyku: 7 } },
  });
  assert.deepEqual(sunucu, { '2026-10-04': { ali: { spor: false, su: 1 }, yagmur: { ders: true } } });
});

test('bekliyorMu', () => {
  const k = { '2026-10-04': { su: null } };
  assert.equal(bekliyorMu(k, '2026-10-04', 'su'), true);
  assert.equal(bekliyorMu(k, '2026-10-04', 'spor'), false);
  assert.equal(bekliyorMu(k, '2026-10-03', 'su'), false);
});

function sahteDepo(baslangic = {}) {
  const v = { ...baslangic };
  return { getItem: (a) => (a in v ? v[a] : null), setItem: (a, d) => { v[a] = String(d); } };
}

test('kuyruk telefona yazılıp okunur', () => {
  const depo = sahteDepo();
  assert.deepEqual(kuyrukOku(depo), {});
  kuyrukYaz({ '2026-10-04': { spor: true } }, depo);
  assert.deepEqual(kuyrukOku(depo), { '2026-10-04': { spor: true } });
});

test('bozuk kayıt boş kuyruk döner', () => {
  assert.deepEqual(kuyrukOku(sahteDepo({ 'takip.kuyruk': '{bozuk' })), {});
});
