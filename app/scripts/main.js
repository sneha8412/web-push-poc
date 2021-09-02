

'use strict';

const applicationServerPublicKey = 'BKfdJA_38dfBR-lV_IDIJhg4xKH92gZYuQtQslB9RhUBaLeoeVhcrBq0JDXGVFvUYC99uPIR8Opj4zt_oBlqJ8s'; 
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

// this code checks if the service worker and push messaging is supported 
// by the current browser and registers the service worker
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


// will check if the user is currently subscribed, and  call
// updateBtn which will enable our button and change the text if 
// the user is subscribed or not.
function initializeUI() {
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      // Unsubscribe user
      unsubscribeUser();
      //unsubscribeUser('subs2');
    } else {
      //subscribe the user
      subscribeUser('subs1');
      subscribeUser('subs2');
    }
  });
  // Set the initial subscription value
  //getSubscription() is a method that returns a promise 
  //that resolves with the current subscription if there is one, 
  //otherwise it'll return null
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    if (isSubscribed) {
      console.log('User IS subscribed.');
      console.log(`serviceworker is registerd to this endpoint ${subscription.endpoint}`);

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
    // DisplaySubscriptionInformation(null);
    return;
  }
  //changes the text depending on the whether the user
  // is subscribed or not and then enables the button.
  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }
  pushButton.disabled = false;
}


// Service Worker registered is subscribed to a specific AppServerKey here
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

    // update the HTMl element to show the subscription.endpoint value 
    const swSubsEndpointDisplay = document.getElementById('swsubs');
    swSubsEndpointDisplay.textContent = JSON.stringify(subscription.endpoint);

  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

// updates the main web page to show the subscription details
function DisplaySubscriptionInformation(subscription, subs_num) {
  //  Send subscription to application server
  // const subscriptionJson = document.querySelector('.js-subscription-json');

  let subscriptionJson = null;

  if (subs_num)
  {
    subscriptionJson = document.getElementById(subs_num);
  }
  else
  {
    subscriptionJson = document.querySelector('.js-subscription-details');
  }

  //const subscriptionDetails = document.querySelector('.js-subscription-details');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription.endpoint);
    //subscriptionDetails.classList.remove('is-invisible');
  } else {
    //subscriptionDetails.classList.add('is-invisible');
  }
}


function unsubscribeUser() {
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
    
    DisplaySubscriptionInformation(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();

     // update the HTMl element to show the subscription.endpoint value 
     const swSubsEndpointDisplay = document.getElementById('swsubs');
     swSubsEndpointDisplay.textContent = '';
  });
}


    