const CACHE_NAME_PREFIX = 'lecteur-scolaire';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_NAME_PREFIX)).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', () => {
  // Réseau direct. Aucun cache applicatif agressif pour éviter les données périmées.
});
