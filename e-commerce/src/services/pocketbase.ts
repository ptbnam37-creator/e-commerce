import PocketBase, { RecordModel } from 'pocketbase';

const POCKETBASE_URL = import.meta.env.DEV 
  ? 'http://127.0.0.1:8090' 
  : 'https://e-commerce-backend-73cc.onrender.com';

export const pb = new PocketBase(POCKETBASE_URL);
pb.autoCancellation(false);

// Helper to get file URL from PocketBase
export const getFileUrl = (record: RecordModel, filename: string): string => {
  return pb.files.getURL(record, filename) || '';
};
