

'use strict';

const applicationServerPublicKey = 'BEmPvxP7HAjio_qu1T85wVt3RWExgDtHwwJHo7qd59ss8VPp74MX9RNvUx2kebcdI-5kt2pCDAaZs5w9XbLQJd8'; 

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
    initializeUI(); //  calls subscribe
    initialzeResubscribe(); //3rd subscription
    initializeValidateBugButton(); //validate if there is a bug
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
      //subscribeUser('subs1');
      //subscribeUser('subs2');
      //documentSubscribeTwoPushsWithOptions();

      // const options = {
      //   userVisibleOnly: true,
      //   applicationServerKey: applicationServerPublicKey
      // }
      // workerSubscribePushWithOptions(options);

      documentSubscribePushWithAppServerKeys();
    }
  });
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

function documentSubscribeTwoPushsWithOptions() {
  let subscription_promises = [];
  const options = {
    userVisibleOnly: true,
    applicationServerKey: applicationServerPublicKey
  }

  navigator.serviceWorker.ready
    .then(swReg => {
      subscription_promises.push(swReg.pushManager.subscribe(options));
      subscription_promises.push(swReg.pushManager.subscribe(options));

      Promise.allSettled(subscription_promises)
      .then(subscriptions => {
  
        let num = 1;
  
        subscriptions.forEach(sub => {
          console.log('User is subscribed.');
          
          let subs_num = `subs${num}`;

          //console.log(sub.endpoint);
      
          DisplaySubscriptionInformation(sub, subs_num);
      
          isSubscribed = true;
      
          updateBtn();
      
          //call the getsubscription() and return the output on the webpage for each subs
          GetAndDisplaySWSubsEndpoint(subs_num)
  
          num += 1;
        });
      }).catch(function(err){
        console.log('Failed to subscribe the user: ', err);
        updateBtn();
      });

    });
}
//-----------------------Subscribe From Service Worker---------------------------
function workerSubscribePushWithOptions(options) {
  navigator.serviceWorker
    .ready.then(swRegistration => {
        swRegistration.active.postMessage({
          command: "subscribe-multiple-times",
          options
        });
    }).catch(function(err){
      console.log("Error sending message to service worker: ", err);
    });
}

navigator.serviceWorker.addEventListener("message", event => {
  const subscriptions = JSON.parse(event.data);
  //const subscriptions = subscriptionsData.subscriptions;
  let num = 1;
  subscriptions.forEach(sub => {
    //console.log('User is subscribed.');
    let subs_num = `subs${num}`;
    DisplaySubscriptionInformation(sub, subs_num);
    isSubscribed = true;
    updateBtn();
    //call the getsubscription() and return the output on the webpage for each subs
    GetAndDisplaySWSubsEndpoint(subs_num);
    num += 1;
  });

});

//------------SUBSCRIBE WITH DIFFERENT APPLICATION SERVER KEYS -------------------
function documentSubscribePushWithAppServerKeys() {
  let subscription_promises = [];
  //const appServerKeys = JSON.parse('[ 'I\u008F\u00BF\u0013\u00FB\u001C\b\u00E2\u00A3\u00FA\u00AE\u00D5?9\u00C1[wEa1\u20AC;G\u00C3\u0002G\u00A3\u00BA\u009D\u00E7\u00DB,\u00F1S\u00E9\u00EF\u0192\u0017\u00F5\u0013oS\u001D\u00A4y\u00B7\u001D#\u00EEd\u00B7jB\f\u0006\u2122\u00B3\u0153=]\u00B2\u00D0%\u00DF', 'I\u008F\u00BF\u0013\u00FB\u001C\b\u00E2\u00A3\u00FA\u00AE\u00D5?9\u00C1[wEa1\u20AC;G\u00C3\u0002G\u00A3\u00BA\u009D\u00E7\u00DB,\u00F1S\u00E9\u00EF\u0192\u0017\u00F5\u0013oS\u001D\u00A4y\u00B7\u001D#\u00EEd\u00B7jB\f\u0006\u2122\u00B3\u0153=]\u00B2\u00D0%\u00DF', 'I\u008F\u00BF\u0013\u00FB\u001C\b\u00E2\u00A3\u00FA\u00AE\u00D5?9\u00C1[wEa1\u20AC;G\u00C3\u0002G\u00A3\u00BA\u009D\u00E7\u00DB,\u00F1S\u00E9\u00EF\u0192\u0017\u00F5\u0013oS\u001D\u00A4y\u00B7\u001D#\u00EEd\u00B7jB\f\u0006\u2122\u00B3\u0153=]\u00B2\u00D0%\u00DF' ]');
  const appServerKeys = [ applicationServerPublicKey, 'AMv56cECmmmgQbtWB8fSleb7tEr_Cl-ry2Nvg_5zppkIKRTb-FFwrUrYa4kMvOLNZVMeF6jdLMvnWzRMKTyAvAg', 'AIJdz-y7xieDL4W667OBH9gjhy4IQ3P3mpy07vZ62I_Zuc8sBHYTx57FP8PS5UAqTJtzmxK6EvW8vj0jpegR15A'];
  navigator.serviceWorker.ready
    .then(swRegistration => {
      for (let i = 0; i < appServerKeys.length; ++i) {
        let options = {
          userVisibleOnly: true,
          applicationServerKey: appServerKeys[i]
        };
        subscription_promises.push(swRegistration.pushManager.subscribe(options));
      }
      /*
      Promise.all(subscription_promises.map(p => p.catch(e => e?.stack))).then(s => {
        console.log(JSON.stringify(s));
      }).catch((err) => {
        console.log(err);
      });
      */
      Promise.allSettled(subscription_promises)
        .then(results => {
          console.log(JSON.stringify(results));
          const subscription = results[0];
          const error = `${results[1].status} - ${results[1].reason.stack}`;
          const resultList = JSON.stringify([subscription, error]);
          console.log(`${resultList}`);
        }).catch((err) => { 
          console.log("error waiting for subscribe promises" + err) });
    }).catch((err) => { 
      console.log("error SW ready" + err)});
}

//-----------SUBSCRIBE USER-----------------------------------------------
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
//------------DISPLAY---------------------------------------------
//Displays the 3rd subscription and SW subscription endpoint
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

//Service Worker subscription endpoint Display
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

// Displays subscription details
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
  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription); //subscription.endpoint;  
  } else {
    subscriptionJson.textContent = '';
  }
}
//------------------------------------------------------------------------------------

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
    DisplaySubscriptionInformation(null, 'subs3');//changes made

    console.log('User is unsubscribed.');
    isSubscribed = false;
    updateBtn();

    //call the getsubscription() and return the output on the webpage for each subs
    GetAndDisplaySWSubsEndpoint('subs1');
    GetAndDisplaySWSubsEndpoint('subs2');
    GetAndDisplaySWSubsEndpoint('subs3'); //changes made

    let validationResults = document.getElementById("validationResult");
    validationResults.textContent = '';

  });
}

//------------3rd SUBSCRIPTION-----------------------------------------------------------------------
function initialzeResubscribe() {
  pushResubscribeButton.addEventListener('click', function() {
    //subscribe the user
    resubscribeUser('subs3');
  });
}

// Resubscribe for new button 
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

//-------------------Validate Bug Button-------------------------
function initializeValidateBugButton() {

  const validateBugButton = document.getElementById('validateBugButton');

  const swsubs1 = document.getElementById('swsubs1');
  const swsubs2 = document.getElementById('swsubs2');

  let validationResult = document.getElementById("validationResult");

  validateBugButton.addEventListener('click', function() {

    if( swsubs1.textContent === swsubs2.textContent )
    {
      validationResult.textContent = "SW Endpoint SAME";
    }
    else
    {
      validationResult.textContent = "SW Endpoint CHANGED! - Bug";
    }
  });

};
    