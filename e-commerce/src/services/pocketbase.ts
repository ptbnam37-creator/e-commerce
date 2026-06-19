import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://anymore-ship-onlooker.ngrok-free.dev');

// Bypass ngrok browser warning interstitial page for API requests
pb.beforeSend = function (url, options) {
  options.headers = Object.assign({}, options.headers, {
    'ngrok-skip-browser-warning': 'true',
  });
  return { url, options };
};

// Helper to get file URL with ngrok bypass (for <img> tags which can't send headers)
export const getFileUrl = (record: any, filename: string): string => {
  const url = pb.files.getURL(record, filename);
  if (!url) return '';
  return url.includes('?') ? `${url}&ngrok-skip-browser-warning=true` : `${url}?ngrok-skip-browser-warning=true`;
};
