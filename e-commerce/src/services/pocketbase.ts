import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://e-commerce-backend-xne7.onrender.com');

// Helper to get file URL from PocketBase
export const getFileUrl = (record: any, filename: string): string => {
  return pb.files.getURL(record, filename) || '';
};
