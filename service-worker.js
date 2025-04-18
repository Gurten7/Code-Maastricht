if ('serviceWorker' in navigator) {
  // Registreer de service worker wanneer de pagina volledig geladen is
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Code-Maastricht/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker geregistreerd met scope:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ Fout bij het registreren van de Service Worker:', error);
      });
  });
}
