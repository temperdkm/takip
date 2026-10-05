// Uygulama internetsiz de açılsın diye dosyaları önbelleğe alır.
// HER YAYINDA CACHE numarasını artır, yoksa telefon eski sürümde kalır.
const CACHE = 'takip-v1';
const FONT_CACHE = 'takip-font';
const DOSYALAR = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/stil.css',
  'js/uygulama.js',
  'js/ekran.js',
  'js/gun.js',
  'js/kurallar.js',
  'js/kuyruk.js',
  'js/veri.js',
  'js/kimlik.js',
  'ikon/ikon-180.png',
  'ikon/ikon-192.png',
  'ikon/ikon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((adlar) => Promise.all(adlar.filter((a) => a !== CACHE && a !== FONT_CACHE).map((a) => caches.delete(a))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONT_CACHE).then(async (c) => {
      const kayitli = await c.match(e.request);
      if (kayitli) return kayitli;
      const yanit = await fetch(e.request);
      c.put(e.request, yanit.clone());
      return yanit;
    }));
  }
  // Firebase istekleri olduğu gibi ağa gider.
});
