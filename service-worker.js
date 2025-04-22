// Voeg OneSignal toe aan je service worker
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Hier kun je je eigen caching/logic toevoegen als je dat wil:

self.addEventListener('install', function (event) {
  console.log('✅ Service worker geïnstalleerd');
});

self.addEventListener('activate', function (event) {
  console.log('✅ Service worker geactiveerd');
});

// Eventueel: standaard fetch-handler (optioneel, voor caching etc.)
// self.addEventListener('fetch', function (event) {
//   console.log('Fetch request voor:', event.request.url);
//   // Je kunt hier caching logica toevoegen als gewenst
// });
