

'use strict';

const applicationServerPublicKey = 'BN8NbJZV5Gi4gnOqtrJVi0NSm3ZS0Y-eeS2idexC687k3EZ6IU1QOlCZ5sMl5Pv2hwsZKfrT-VSJIAcAeluAHD0'; 
//'BCz2SjrXWb_FDChmq2cXkRWc7vkCCGKvAw5xy8gbTZ9oq99v66zXldG6FQvvP23Qf4e0kykwgVImAUVWHYBlJsA';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
    initializeUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}

// will check if the user is currently subscribed, and one called updateBtn which will enable our button and change the text if the user is subscribed or not.

function initializeUI() {

  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      // TODO: Unsubscribe user
      unsubscribeUser('subs1');
      unsubscribeUser('subs2');
    } else {
      subscribeUser('subs1');
      subscribeUser('subs2');
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    if (isSubscribed) {
      console.log('User IS subscribed.');
      console.log(`swreg ${subscription.endpoint}`);
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

// sets the text of the button to enable or disable 
function updateBtn() {

  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    DisplaySubscriptionInformation(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

// Service Worker registered s subscribed to a specific AppServerKey here
function subscribeUser(subs_num) {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    console.log(subscription.endpoint);

    DisplaySubscriptionInformation(subscription, subs_num);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

// updates the main web page to show the subscription details
function DisplaySubscriptionInformation(subscription, subs_num) {
  // TODO: Send subscription to application server

  // const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionJson = document.getElementById(subs_num);
  const subscriptionDetails = document.querySelector('.js-subscription-details');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    //subscriptionDetails.classList.add('is-invisible');
  }
}


function unsubscribeUser(subs_num) {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    DisplaySubscriptionInformation(null, subs_num);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}

