
'use strict';

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log("event: " + event);
    console.log("event.data: " + event.data);
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  
    const title = 'Push Codelab';
    const options = {
      body: 'Yay it works.',
      icon: 'images/icon.png',
      badge: 'images/badge.png'
    };
  
    // Broswer will keep service worker alive until the notification has finioshed being shown
    const notificationPromise = self.registration.showNotification(title, options);
    event.waitUntil(notificationPromise);
  });

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://www.microsoft.com/')
    );
});
