import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunAnahtari } from '../js/gun.js';
import { tikSayisi, sayiYaz } from '../js/kurallar.js';

const kaynak = readFileSync(new URL('../widget/takip-widget.js', import.meta.url), 'utf8');
const [saf, scriptable] = kaynak.split('// --- Scriptable ---');
const w = new Function(`${saf}\nreturn { ODA, BEN, gunAnahtari, tikSayisi, sayiYaz, olcuYaz, saatYaz, siraliKisiler };`)();

test('depodaki kopyada oda kodu ve kişi boş', () => {
  assert.equal(w.ODA, '');
  assert.equal(w.BEN, '');
  assert.ok(saf.includes("const ODA = '';"));
  assert.ok(saf.includes("const BEN = '';"));
});

test('Scriptable bölümü var', () => {
  assert.ok(scriptable && scriptable.includes('new ListWidget()'));
});

test('gün anahtarı uygulamayla aynı', () => {
  for (const an of [new Date(2026, 9, 5, 3, 59), new Date(2026, 9, 5, 4, 0), new Date(2027, 0, 1, 2, 0), new Date(2026, 2, 1, 1, 0)]) {
    assert.equal(w.gunAnahtari(an), gunAnahtari(an));
  }
});

test('tik sayısı uygulamayla aynı', () => {
  const ornekler = [undefined, {}, { ders: true, spor: true, yemek: true, su: 2 }, { ders: true, su: 1.99, uyku: 9 }, { spor: false, yemek: true, su: 3 }];
  for (const k of ornekler) assert.equal(w.tikSayisi(k), tikSayisi(k));
});

test('sayı ve ölçü yazımı', () => {
  for (const v of [2.1, 6, 0, 7.25, undefined]) assert.equal(w.sayiYaz(v), sayiYaz(v));
  assert.equal(w.olcuYaz(2.1, 'L'), '2,1 L');
  assert.equal(w.olcuYaz(undefined, 'L'), '—');
});

test('saat ve sıra', () => {
  assert.equal(w.saatYaz(new Date(2026, 9, 4, 9, 5)), '09:05');
  assert.deepEqual(w.siraliKisiler('yagmur'), ['yagmur', 'ali']);
  assert.deepEqual(w.siraliKisiler('ali'), ['ali', 'yagmur']);
});
