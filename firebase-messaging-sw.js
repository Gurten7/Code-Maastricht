importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA9PTsrTBR7cYf1oAfPtnyF4g9laqkdwng",
  authDomain: "puzzeltocht-maastricht.firebaseapp.com",
  projectId: "puzzeltocht-maastricht",
  messagingSenderId: "825884044147",
  appId: "1:825884044147:web:f329c4af2373cbedbcb306"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("📦 Ontvangen in background: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png" // Vervang eventueel door je eigen icoonbestand
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
