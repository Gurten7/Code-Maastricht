// Bij installatie van de service worker, wordt deze toegevoegd aan de cache
self.addEventListener('install', event => {
  console.log('Service Worker is geïnstalleerd!');
  event.waitUntil(
    caches.open('my-cache-v1').then(cache => {
      return cache.addAll([
        '/', // Je rootpagina
        '/index.html', // Voorbeeldpagina
        '/style.css', // CSS-bestanden
        '/icon-192.png', // App-icoon
        '/icon-512.png'
      ]);
    })
  );
});

// Wanneer een fetch-verzoek wordt gedaan, wordt de cache gecontroleerd
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Pushmelding afhandelen
self.addEventListener('push', event => {
  let options = {
    body: event.data.text(), // Het bericht van de pushmelding
    icon: '/icon-192.png', // Pictogram voor de melding
    badge: '/icon-192.png', // Badge voor de melding
    data: {
      url: '/' // De URL waar naartoe genavigeerd moet worden wanneer je op de melding klikt
    }
  };

  event.waitUntil(
    self.registration.showNotification('Nieuwe Melding', options)
  );
});

// Wanneer de gebruiker op een pushmelding klikt
self.addEventListener('notificationclick', event => {
  event.notification.close();

  // Hier kun je bepalen wat er moet gebeuren als de gebruiker op de melding klikt
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
