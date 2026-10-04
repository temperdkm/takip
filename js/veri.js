// Firebase Realtime Database ile REST üzerinden konuşur.
export const DB_URL = 'https://chematic-91273-default-rtdb.europe-west1.firebasedatabase.app';

export class BaglantiHatasi extends Error {}
export class YetkiHatasi extends Error {}

async function istek(url, secenekler) {
  let yanit;
  try {
    yanit = await fetch(url, secenekler);
  } catch (e) {
    throw new BaglantiHatasi(e.message);
  }
  if (yanit.status === 401 || yanit.status === 403) throw new YetkiHatasi(String(yanit.status));
  if (!yanit.ok) throw new BaglantiHatasi(String(yanit.status));
  return yanit.json();
}

export function okumaAdresi(oda, baslangic, taban = DB_URL) {
  const sorgu = new URLSearchParams({ orderBy: '"$key"', startAt: `"${baslangic}"` });
  return `${taban}/takip/${oda}.json?${sorgu}`;
}

export function yazmaAdresi(oda, gun, ben, taban = DB_URL) {
  return `${taban}/takip/${oda}/${gun}/${ben}.json`;
}

// Başlangıç gününden sonrası: { gün: { ali: {...}, yagmur: {...} } }
export async function oku(oda, baslangic, taban = DB_URL) {
  return (await istek(okumaAdresi(oda, baslangic, taban))) || {};
}

// Sadece verilen alanlar değişir; null alanı siler.
export async function yaz(oda, gun, ben, alanlar, taban = DB_URL) {
  return istek(yazmaAdresi(oda, gun, ben, taban), { method: 'PATCH', body: JSON.stringify(alanlar) });
}
