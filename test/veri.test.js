import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DB_URL, okumaAdresi, yazmaAdresi, oku, yaz, YetkiHatasi, BaglantiHatasi } from '../js/veri.js';

const TABAN = 'https://db.ornek';

test('adresler', () => {
  assert.equal(okumaAdresi('oda1', '2026-09-27', TABAN), 'https://db.ornek/takip/oda1.json?orderBy=%22%24key%22&startAt=%222026-09-27%22');
  assert.equal(yazmaAdresi('oda1', '2026-10-04', 'ali', TABAN), 'https://db.ornek/takip/oda1/2026-10-04/ali.json');
  assert.equal(DB_URL, 'https://chematic-91273-default-rtdb.europe-west1.firebasedatabase.app');
});

test('yaz: PATCH ile sadece verilen alanlar', async () => {
  const eski = globalThis.fetch;
  let gelen;
  try {
    globalThis.fetch = async (url, s) => { gelen = { url, ...s }; return { ok: true, status: 200, json: async () => ({ spor: true }) }; };
    await yaz('o', '2026-10-04', 'ali', { spor: true }, TABAN);
    assert.equal(gelen.url, 'https://db.ornek/takip/o/2026-10-04/ali.json');
    assert.equal(gelen.method, 'PATCH');
    assert.equal(gelen.body, '{"spor":true}');
  } finally {
    globalThis.fetch = eski;
  }
});

test('hata türleri ve boş veri', async () => {
  const eski = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({ error: 'Permission denied' }) });
    await assert.rejects(yaz('o', '2026-10-04', 'ali', { ders: true }, TABAN), YetkiHatasi);
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
    await assert.rejects(oku('o', '2026-09-27', TABAN), BaglantiHatasi);
    globalThis.fetch = async () => ({ ok: false, status: 503, json: async () => ({}) });
    await assert.rejects(oku('o', '2026-09-27', TABAN), BaglantiHatasi);
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => null });
    assert.deepEqual(await oku('o', '2026-09-27', TABAN), {});
  } finally {
    globalThis.fetch = eski;
  }
});
