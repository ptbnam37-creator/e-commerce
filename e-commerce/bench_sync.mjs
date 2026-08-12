import { performance } from 'perf_hooks';

class MockPocketBase {
  collection(name) {
    return {
      getFullList: async () => Array.from({length: 100}, (_, i) => ({ id: i, name: `Product ${i}`, price: 100 })),
      delete: async (id) => new Promise(resolve => setTimeout(resolve, 5)), // 5ms latency
      create: async (data) => new Promise(resolve => setTimeout(resolve, 5))
    }
  }
}

async function runBaseline() {
    const localPb = new MockPocketBase();
    const records = Array.from({length: 100}, (_, i) => ({ id: i, name: `Product ${i}`, price: 100 }));
    const localRecords = Array.from({length: 100}, (_, i) => ({ id: i }));

    const start = performance.now();

    // baseline delete
    for (const r of localRecords) {
      await localPb.collection('product').delete(r.id);
    }

    // baseline create
    for (let i = 0; i < records.length; i++) {
      const { collectionId, collectionName, id, created, updated, expand, ...data } = records[i];
      await localPb.collection('product').create({ id, ...data });
    }

    return performance.now() - start;
}

async function runOptimized() {
    const localPb = new MockPocketBase();
    const records = Array.from({length: 100}, (_, i) => ({ id: i, name: `Product ${i}`, price: 100 }));
    const localRecords = Array.from({length: 100}, (_, i) => ({ id: i }));

    const start = performance.now();

    const CHUNK_SIZE = 50;

    // optimized delete
    for (let i = 0; i < localRecords.length; i += CHUNK_SIZE) {
      const chunk = localRecords.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(r => localPb.collection('product').delete(r.id)));
    }

    // optimized create
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (record) => {
        const { collectionId, collectionName, id, created, updated, expand, ...data } = record;
        await localPb.collection('product').create({ id, ...data });
      }));
    }

    return performance.now() - start;
}

async function run() {
    const baseTime = await runBaseline();
    const optTime = await runOptimized();
    console.log(`Baseline avg: ${baseTime.toFixed(2)} ms`);
    console.log(`Optimized avg: ${optTime.toFixed(2)} ms`);
}

run();
