const CACHE_NAME = 'quoter-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Les images de fond seront mises en cache dynamiquement
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Gestion spéciale pour les images
  if (event.request.url.endsWith('.webp') || 
      event.request.url.endsWith('.png') || 
      event.request.url.endsWith('.jpg') || 
      event.request.url.endsWith('.jpeg')) {
    
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Si l'image est en cache, on la retourne
          if (response) {
            return response;
          }
          
          // Sinon, on la récupère en ligne et on la met en cache
          return fetch(event.request)
            .then((response) => {
              // Vérifier que la réponse est valide
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Cloner la réponse car elle est un stream et ne peut être utilisée qu'une fois
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            });
        })
        .catch(() => {
          // En cas d'erreur (hors ligne), on peut retourner une image de secours
          // ou laisser l'erreur se propager
          return caches.match('/placeholder.webp');
        })
    );
  } else {
    // Pour les autres requêtes, stratégie réseau d'abord, puis cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Vérifier que la réponse est valide
          if (response && response.status === 200) {
            // Mettre en cache la réponse pour les requêtes GET
            if (event.request.method === 'GET') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
          }
          return response;
        })
        .catch(() => {
          // En cas d'erreur, essayer de retourner depuis le cache
          return caches.match(event.request);
        })
    );
  }
});

// Nettoyer les anciens caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});
