// service-worker.js

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      return cache.addAll([
        '/', 
        '/index.html',
        '/styles.css',
        '/script.js',
        // Voeg meer bestanden toe die je offline beschikbaar wilt maken
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Pushmelding';
  const options = {
    body: data.message || 'Er is een nieuwe melding!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
