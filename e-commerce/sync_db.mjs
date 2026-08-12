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
    await Promise.all(localRecords.map(r => localPb.collection('product').delete(r.id)));
    console.log('Local products cleared.');

    console.log('Importing to local PocketBase...');
    for (let i = 0; i < records.length; i++) {
      const { collectionId, collectionName, id, created, updated, expand, ...data } = records[i];
      await localPb.collection('product').create({ id, ...data });
      console.log(`Imported ${i + 1}/${records.length}: ${data.name}`);
    }
    console.log('Sync complete!');
  } catch (err) {
    console.error('Error syncing:', err);
  }
}

run();
