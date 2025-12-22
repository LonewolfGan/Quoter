const CACHE_NAME = 'quoter-cache-v2'; // Version incrémentée
const bgImages = Array.from({length: 10}, (_, i) => `/bg_images/${61 + i}.webp`);
const urlsToCache = [
  '/',
  '/index.html',
  '/placeholder.webp',
  '/manifest.json',
  '/favicon.ico',
  '/favicon_1.ico',
  '/logo1.webp',
  '/logo2.webp',
  ...bgImages  // Ajout des images de fond
];

// Fonction utilitaire pour filtrer les requêtes
const shouldHandleRequest = (request) => {
  if (request.method !== 'GET') return false;

  try {
    const url = new URL(request.url);

    // Ne gérer que http / https
    if (!url.protocol.startsWith('http')) return false;

    // Ignorer chrome-extension et Vercel Analytics / Speed Insights
    if (url.protocol === 'chrome-extension:') return false;
    if (url.pathname.includes('_vercel/insights/') || url.pathname.includes('_vercel/speed-insights/')) return false;
  } catch (err) {
    return false; // URL invalide
  }

  return true;
};

// Install event : pré-cache les assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Fetch event : stratégie cache dynamique pour images + network-first pour les autres
self.addEventListener('fetch', (event) => {
  if (!shouldHandleRequest(event.request)) return;

  const isImageRequest = /\.(webp|png|jpg|jpeg|gif|svg)$/i.test(event.request.url);

  if (isImageRequest) {
    // Cache-first pour les images
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, responseToCache);
            } catch (err) {
              console.warn('Impossible de mettre en cache l’image :', event.request.url, err);
            }
          });

          return response;
        }).catch(() => caches.match('/placeholder.webp'));
      })
    );
  } else {
    // Network-first pour tout le reste
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              try {
                cache.put(event.request, responseToCache);
              } catch (err) {
                console.warn('Impossible de mettre en cache la ressource :', event.request.url, err);
              }
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// Activate event : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});
