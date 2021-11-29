
'use strict';

self.onmessage = event => {
  switch (event.data.command) {
    case "subscribe-multiple-times":
      subscribeMultipleTimes(event.data.options);
      break;

    default:
      sendMessageToClients("message", "error - unknown message request");
      break;
  }
};

function subscribeMultipleTimes(options){
  let subscribePromises = [];
  subscribePromises.push(self.registration.pushManager.subscribe(options));
  subscribePromises.push(self.registration.pushManager.subscribe(options));
  
  Promise.all(subscribePromises)
  .then(subscriptions => {

    clients.matchAll({ includeUncontrolled: true })
    .then(clients =>
      clients.forEach(client => {
        let subscriptionArray = JSON.stringify(subscriptions);
        client.postMessage(subscriptionArray);
      })
      , error => console.log(error));
  }).catch(function(err){
    console.log('service wofrker Failed to subscribe: ', err);
  });
}

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

self.addEventListener("pushsubscriptionchange", event => {

  console.log("Subscription was changed:" + JSON.stringify(event));

}, false);
