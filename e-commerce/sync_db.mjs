import PocketBase from 'pocketbase';
const remotePb = new PocketBase('https://e-commerce-backend-73cc.onrender.com');
const localPb = new PocketBase('http://127.0.0.1:8090');

async function run() {
  try {
    console.log('Fetching products from remote PocketBase...');
    const records = await remotePb.collection('product').getFullList();
    console.log(`Found ${records.length} remote products.`);

    console.log('Clearing local products...');
    const localRecords = await localPb.collection('product').getFullList();

    const CHUNK_SIZE = 50;

    for (let i = 0; i < localRecords.length; i += CHUNK_SIZE) {
      const chunk = localRecords.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(r => localPb.collection('product').delete(r.id)));
    }
    console.log('Local products cleared.');

    console.log('Importing to local PocketBase...');
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (record) => {
        const { collectionId, collectionName, id, created, updated, expand, ...data } = record;
        await localPb.collection('product').create({ id, ...data });
      }));
      console.log(`Imported chunk up to ${Math.min(i + CHUNK_SIZE, records.length)}/${records.length}`);
    }
    console.log('Sync complete!');
  } catch (err) {
    console.error('Error syncing:', err);
  }
}

run();
