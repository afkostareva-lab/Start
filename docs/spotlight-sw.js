/* Spotlight 7 — работа без интернета для страниц модулей.
   ОДИН service worker на весь сайт: два воркера с одной областью (scope "./") вытесняют друг друга,
   поэтому все модули перечислены здесь, а каждая страница модуля регистрирует именно этот файл.
   При любом изменении страниц подними номер версии в CACHE, иначе телефоны будут держать старую копию. */
const CACHE = "spotlight-v3";
const FILES = [
  // Module 3
  "module3.html", "module3-words.html", "writings.html", "m3-icon.png", "m3.webmanifest",
  // Module 4
  "module4.html", "module4-words.html", "module4-writings.html", "m4-icon.png", "m4.webmanifest",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys
      .filter(k => (k.startsWith("spotlight-") || k.startsWith("module3-")) && k !== CACHE)
      .map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const name = url.pathname.split("/").pop();
  if (e.request.method !== "GET" || url.origin !== location.origin || !FILES.includes(name)) return;
  // Сначала сеть (свежая версия), без сети — из кэша
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
