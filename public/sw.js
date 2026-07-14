const APP_SHELL_CACHE = 'behold-app-shell-v1';
const BIBLE_DATA_CACHE = 'behold-bible-data-v1';

// Built asset filenames are hashed, so only precache the entry points.
// Everything else is cached at runtime by the fetch handler below.
const appShellUrls = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(cache => {
      return cache.addAll(appShellUrls);
    }).catch(err => {
      console.error('Failed to cache assets during install:', err);
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [APP_SHELL_CACHE, BIBLE_DATA_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = event.request.url;
  if (url.startsWith('https://cdn.jsdelivr.net/gh/wldeh/bible-api/') || url.startsWith('https://bolls.life/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(BIBLE_DATA_CACHE).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Only cache basic, same-origin requests.
            if (networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(APP_SHELL_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetching failed:', error);
          throw error;
        });
      })
  );
});
