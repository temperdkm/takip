// Tarayıcı doğrulaması için bağımlılıksız statik sunucu. gizli/ klasörünü sunmaz.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = fileURLToPath(new URL('..', import.meta.url));
const GIZLI = join(KOK, 'gizli');
const PORT = Number(process.env.PORT) || 8080;
const TURLER = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
};

createServer(async (istek, yanit) => {
  let yol = decodeURIComponent(new URL(istek.url, 'http://yerel').pathname);
  if (yol.endsWith('/')) yol += 'index.html';
  const dosya = normalize(join(KOK, yol));
  if (!dosya.startsWith(KOK) || dosya.startsWith(GIZLI)) {
    yanit.writeHead(403).end();
    return;
  }
  try {
    const icerik = await readFile(dosya);
    yanit.writeHead(200, { 'Content-Type': TURLER[extname(dosya)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    yanit.end(icerik);
  } catch {
    yanit.writeHead(404).end('yok');
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
