const mockRecords = Array.from({ length: 100 }, (_, i) => ({ id: `id${i}`, name: `product${i}` }));

// Mock localPb
const localPb = {
  collection: (name) => ({
    getFullList: async () => mockRecords,
    delete: async (id) => {
        return new Promise(resolve => setTimeout(resolve, 5)); // 5ms simulated latency
    },
    create: async (data) => {
        return new Promise(resolve => setTimeout(resolve, 5)); // 5ms simulated latency
    }
  })
};

async function originalSync() {
  const start = performance.now();

  const localRecords = await localPb.collection('product').getFullList();
  for (const r of localRecords) {
    await localPb.collection('product').delete(r.id);
  }

  for (let i = 0; i < mockRecords.length; i++) {
    const { collectionId, collectionName, id, created, updated, expand, ...data } = mockRecords[i];
    await localPb.collection('product').create({ id, ...data });
  }

  const end = performance.now();
  console.log(`Original: ${end - start} ms`);
}

async function optimizedSync() {
  const start = performance.now();

  const CHUNK_SIZE = 50;

  const localRecords = await localPb.collection('product').getFullList();
  for (let i = 0; i < localRecords.length; i += CHUNK_SIZE) {
    const chunk = localRecords.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(r => localPb.collection('product').delete(r.id)));
  }

  for (let i = 0; i < mockRecords.length; i += CHUNK_SIZE) {
    const chunk = mockRecords.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(record => {
        const { collectionId, collectionName, id, created, updated, expand, ...data } = record;
        return localPb.collection('product').create({ id, ...data });
      })
    );
  }

  const end = performance.now();
  console.log(`Optimized (with chunking of 50): ${end - start} ms`);
}

async function run() {
    await originalSync();
    await optimizedSync();
}

run();
