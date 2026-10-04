import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gunAnahtari, gunKaydir, oncekiGunler, tarihYazisi, kisaTarih, duzenlenebilirMi } from '../js/gun.js';

test('gün 04:00 sınırında değişir', () => {
  assert.equal(gunAnahtari(new Date(2026, 9, 5, 3, 59)), '2026-10-04');
  assert.equal(gunAnahtari(new Date(2026, 9, 5, 4, 0)), '2026-10-05');
  assert.equal(gunAnahtari(new Date(2026, 9, 5, 0, 30)), '2026-10-04');
  assert.equal(gunAnahtari(new Date(2026, 9, 4, 23, 59)), '2026-10-04');
});

test('yıl ve ay geçişi', () => {
  assert.equal(gunAnahtari(new Date(2027, 0, 1, 2, 0)), '2026-12-31');
  assert.equal(gunKaydir('2026-03-01', -1), '2026-02-28');
  assert.equal(gunKaydir('2026-12-31', 1), '2027-01-01');
});

test('önceki 7 gün en yeniden eskiye', () => {
  assert.deepEqual(oncekiGunler('2026-10-04', 7), [
    '2026-10-03', '2026-10-02', '2026-10-01', '2026-09-30', '2026-09-29', '2026-09-28', '2026-09-27',
  ]);
});

test('tarih yazıları', () => {
  assert.equal(tarihYazisi('2026-10-04'), 'PAZAR 4 EKİM');
  assert.equal(tarihYazisi('2026-10-03'), 'CUMARTESİ 3 EKİM');
  assert.equal(kisaTarih('2026-10-03'), 'CMT 3 EKİM');
  assert.equal(kisaTarih('2026-09-30'), 'ÇAR 30 EYLÜL');
});

test('düzenlenebilir: bugün ve önceki 7 gün', () => {
  assert.equal(duzenlenebilirMi('2026-10-04', '2026-10-04'), true);
  assert.equal(duzenlenebilirMi('2026-09-27', '2026-10-04'), true);
  assert.equal(duzenlenebilirMi('2026-09-26', '2026-10-04'), false);
  assert.equal(duzenlenebilirMi('2026-10-05', '2026-10-04'), false);
});
