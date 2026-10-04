import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sayfaHtml, kurtarmaHtml, kacis } from '../js/ekran.js';

const GUN = '2026-10-04';
const say = (metin, parca) => metin.split(parca).length - 1;
const d = (ek = {}) => ({
  ben: 'ali', gun: GUN, bugun: GUN, veri: {}, kuyruk: {},
  duzenlenen: null, hata: null, baglanti: 'tamam', gonderilemedi: false, ...ek,
});

test('kendi sütunun solda', () => {
  const a = sayfaHtml(d());
  assert.ok(a.indexOf('ALİ') < a.indexOf('YAĞMUR'));
  const y = sayfaHtml(d({ ben: 'yagmur' }));
  assert.ok(y.indexOf('YAĞMUR') < y.indexOf('ALİ'));
});

test('sadece kendi sütununa dokunulur', () => {
  const s = sayfaHtml(d());
  assert.equal(say(s, 'data-islem="tik"'), 3);
  assert.equal(say(s, 'data-islem="sayi"'), 2);
});

test('tikli hücre', () => {
  const s = sayfaHtml(d({ veri: { [GUN]: { ali: { spor: true } } } }));
  assert.match(s, /data-islem="tik" data-alan="spor" aria-label="Spor" aria-pressed="true"/);
  assert.match(s, /data-islem="tik" data-alan="ders" aria-label="Ders" aria-pressed="false"/);
});

test('su hedefe göre renk, uyku hep ölçü mavisi', () => {
  const s = sayfaHtml(d({ veri: { [GUN]: { ali: { su: 2.1, uyku: 7.5 }, yagmur: { su: 1.4 } } } }));
  assert.match(s, /<span class="olcu">2,1<\/span>/);
  assert.match(s, /<span class="olcu-eksik">1,4<\/span>/);
  assert.match(s, /<span class="olcu">7,5<\/span>/);
});

test('düzenlenen alan sayı kutusu olur', () => {
  const s = sayfaHtml(d({ veri: { [GUN]: { ali: { su: 2.1 } } }, duzenlenen: 'su' }));
  assert.match(s, /<input class="sayi-alani" data-alan="su"[^>]*value="2,1"/);
  assert.equal(say(s, 'data-islem="sayi"'), 1);
});

test('hata satırı', () => {
  const s = sayfaHtml(d({ hata: { alan: 'su', mesaj: '0–10 arası yaz' } }));
  assert.match(s, /class="hata-satir">0–10 arası yaz, kaydedilmedi</);
});

test('yetki hatası şeridi', () => {
  assert.match(sayfaHtml(d({ baglanti: 'yetki' })), /Bağlanamadı, linki kontrol et/);
  assert.doesNotMatch(sayfaHtml(d()), /Bağlanamadı/);
});

test('gönderilmedi işareti sadece gönderim başarısızsa', () => {
  const kuyruk = { [GUN]: { spor: true } };
  assert.equal(say(sayfaHtml(d({ kuyruk, gonderilemedi: true })), 'class="bekliyor"'), 1);
  assert.equal(say(sayfaHtml(d({ kuyruk, gonderilemedi: false })), 'class="bekliyor"'), 0);
});

test('bugün ekranında son 7 gün listesi', () => {
  const s = sayfaHtml(d({ veri: { '2026-10-03': { ali: { ders: true, su: 2 }, yagmur: { uyku: 6 } } } }));
  assert.match(s, /Son 7 gün/);
  assert.equal(say(s, 'data-islem="gun"'), 7);
  assert.match(s, /CMT 3 EKİM/);
  assert.match(s, /<span class="sayac">2\/4<\/span>/);
});

test('geçmiş gün: liste yok, geri var', () => {
  const s = sayfaHtml(d({ gun: '2026-10-03' }));
  assert.doesNotMatch(s, /Son 7 gün/);
  assert.match(s, /data-islem="geri"/);
  assert.match(s, /CUMARTESİ 3 EKİM/);
});

test('kurtarma ekranı', () => {
  const s = kurtarmaHtml('yagmur', 'abc', 'Kişi ya da oda kodu eksik');
  assert.match(s, /data-kisi="ali"/);
  assert.match(s, /class="kisi secili" data-islem="kisi" data-kisi="yagmur"/);
  assert.match(s, /value="abc"/);
  assert.match(s, /Kişi ya da oda kodu eksik/);
  assert.match(s, /data-islem="basla"/);
});

test('kaçış', () => {
  assert.equal(kacis('"<a>&\''), '&quot;&lt;a&gt;&amp;&#39;');
});
