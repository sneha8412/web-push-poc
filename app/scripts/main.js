

'use strict';

const applicationServerPublicKey = 'BKfdJA_38dfBR-lV_IDIJhg4xKH92gZYuQtQslB9RhUBaLeoeVhcrBq0JDXGVFvUYC99uPIR8Opj4zt_oBlqJ8s'; 

const pushButton = document.querySelector('.js-push-btn');
const pushResubscribeButton = document.querySelector('.js-subscribepush-btn');

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
//feature detection, in case there is an older version of the browser
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);
    swRegistration = swReg;
    initializeUI();
    InitialzeResubscribe();
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
    pushButton.textContent = 'Unsubscribe Push Messaging';
  } else {
    pushButton.textContent = 'Two Subscribe calls to Push Messaging';
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

    //call the getsubscription() and return the output on the webpage for each subs
    GetAndDisplaySWSubsEndpoint(subs_num)
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function GetAndDisplaySWSubsEndpoint(subs_num)
{
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    
      if(subs_num === "subs1")
      {
        DisplaySWSubscriptionEndpoint(subscription, "swsubs1");
      }
      else if (subs_num === "subs2")
      {
        DisplaySWSubscriptionEndpoint(subscription, "swsubs2");
      }
      else if (subs_num === "subs3")
      {
        DisplaySWSubscriptionEndpoint(subscription, "swsubs3");
      }

  })
  .catch(function(error) {
    console.log(`Error getting subscription for ${subs_num}`, error);
  });
}

function DisplaySWSubscriptionEndpoint(subscription, swsubs_num)
{
  const swsubs = document.getElementById(swsubs_num);

  if (subscription)
  {
    swsubs.textContent = subscription.endpoint;
  }
  else
  {
    swsubs.textContent = '';
  }
}

// updates the main web page to show the subscription details
function DisplaySubscriptionInformation(subscription, subs_num) {
  //  Send subscription to application server
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
    subscriptionJson.textContent = subscription.endpoint;
    //subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionJson.textContent = '';
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
    
    DisplaySubscriptionInformation(null, 'subs1');
    DisplaySubscriptionInformation(null, 'subs2');
    DisplaySubscriptionInformation(null, 'subs3');

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();

    //call the getsubscription() and return the output on the webpage for each subs
    GetAndDisplaySWSubsEndpoint('subs1');
    GetAndDisplaySWSubsEndpoint('subs2');
    GetAndDisplaySWSubsEndpoint('subs3'); //changes made
  });
}

//
function InitialzeResubscribe() {
  pushResubscribeButton.addEventListener('click', function() {
    //subscribe the user
    resubscribeUser('subs3');
  });
}

// Resubscribe for  new button 
function resubscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');
    console.log(subscription.endpoint);

    DisplaySubscriptionInformation(subscription, 'subs3');

    GetAndDisplaySWSubsEndpoint('subs3');

  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
  });
}
    