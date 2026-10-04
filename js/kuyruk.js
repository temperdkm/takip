// Henüz Firebase'e gidemeyen değişiklikler.
// Biçim: { 'YYYY-MM-DD': { alan: deger } }  — deger null ise alan silinecek.
const ANAHTAR = 'takip.kuyruk';

export function ekle(kuyruk, gun, alan, deger) {
  return { ...kuyruk, [gun]: { ...(kuyruk[gun] || {}), [alan]: deger } };
}

// Gönderilen alanları düşürür; kuyruktaki değer bu arada değiştiyse o alan kalır.
export function dus(kuyruk, gun, gonderilen) {
  const kalan = { ...(kuyruk[gun] || {}) };
  for (const [alan, deger] of Object.entries(gonderilen)) {
    if (alan in kalan && kalan[alan] === deger) delete kalan[alan];
  }
  const yeni = { ...kuyruk };
  if (Object.keys(kalan).length) yeni[gun] = kalan;
  else delete yeni[gun];
  return yeni;
}

// Ekranda gösterilecek veri: sunucu verisinin üstüne `ben` için bekleyenler.
export function birlestir(sunucu, kuyruk, ben) {
  const sonuc = { ...sunucu };
  for (const [gun, alanlar] of Object.entries(kuyruk)) {
    const gunVeri = { ...(sonuc[gun] || {}) };
    const kayit = { ...(gunVeri[ben] || {}) };
    for (const [alan, deger] of Object.entries(alanlar)) {
      if (deger === null) delete kayit[alan];
      else kayit[alan] = deger;
    }
    gunVeri[ben] = kayit;
    sonuc[gun] = gunVeri;
  }
  return sonuc;
}

export function bekliyorMu(kuyruk, gun, alan) {
  return Boolean(kuyruk[gun]) && alan in kuyruk[gun];
}

export function kuyrukOku(depo) {
  try {
    return JSON.parse(depo.getItem(ANAHTAR)) || {};
  } catch {
    return {};
  }
}

export function kuyrukYaz(kuyruk, depo) {
  try {
    depo.setItem(ANAHTAR, JSON.stringify(kuyruk));
  } catch {
    // depolama kapalıysa kuyruk sadece bellekte kalır
  }
}
