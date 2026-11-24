/* Spotlight 7 · Module 3 — работа без интернета.
   После первого открытия страницы модуля сохраняются в кэш телефона и открываются офлайн.
   Остальные страницы сайта этот файл не трогает. */
const CACHE = "module3-v3";
const FILES = ["module3.html", "module3-words.html", "writings.html", "m3-icon.png", "m3.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("module3-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const name = url.pathname.split("/").pop();
  if (e.request.method !== "GET" || url.origin !== location.origin || !FILES.includes(name)) return;
  // Сначала сеть (чтобы видеть свежую версию), без сети — из кэша
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
