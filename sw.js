// Service worker: zorgt dat de app ook offline werkt.
// Strategie: eerst het netwerk proberen (zodat je altijd de nieuwste lessen krijgt),
// en alleen als je offline bent de opgeslagen versie gebruiken.
// Voeg je een nieuwe les toe? Zet hem dan ook in de lijst hieronder en verhoog CACHE_NAAM.

const CACHE_NAAM = "ciao-v1";
const BESTANDEN = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/progress.js",
  "js/exercises.js",
  "js/speech.js",
  "manifest.json",
  "icons/icon.svg",
  "icons/icon-192.png",
  "content/themes.json",
  "content/restaurant/les-1.json",
  "content/restaurant/les-2.json",
  "content/restaurant/les-3.json",
  "content/restaurant/les-4.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAAM).then((c) => c.addAll(BESTANDEN)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(namen.filter((n) => n !== CACHE_NAAM).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((antwoord) => {
        if (antwoord.ok && new URL(e.request.url).origin === location.origin) {
          const kopie = antwoord.clone();
          caches.open(CACHE_NAAM).then((c) => c.put(e.request, kopie));
        }
        return antwoord;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
