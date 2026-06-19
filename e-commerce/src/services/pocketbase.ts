import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://anymore-ship-onlooker.ngrok-free.dev');

// Bypass ngrok browser warning interstitial page
pb.beforeSend = function (url, options) {
  options.headers = Object.assign({}, options.headers, {
    'ngrok-skip-browser-warning': 'true',
  });
  return { url, options };
};
