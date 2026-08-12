import { performance } from 'perf_hooks';

// Mock PocketBase
class MockCollection {
  async getFullList() {
    return Array.from({ length: 100 }, (_, i) => ({ id: i }));
  }
  async delete(id) {
    return new Promise(resolve => setTimeout(resolve, 5)); // simulate 5ms network latency
  }
}

class MockPb {
  collection() {
    return new MockCollection();
  }
}

const localPb = new MockPb();

async function runSequential() {
  const localRecords = await localPb.collection('product').getFullList();
  const start = performance.now();
  for (const r of localRecords) {
    await localPb.collection('product').delete(r.id);
  }
  const end = performance.now();
  return end - start;
}

async function runParallel() {
  const localRecords = await localPb.collection('product').getFullList();
  const start = performance.now();
  await Promise.all(localRecords.map(r => localPb.collection('product').delete(r.id)));
  const end = performance.now();
  return end - start;
}

async function run() {
  console.log('Benchmarking sequential (baseline)...');
  const seqTime = await runSequential();
  console.log(`Sequential time: ${seqTime.toFixed(2)}ms`);

  console.log('Benchmarking parallel (optimized)...');
  const parTime = await runParallel();
  console.log(`Parallel time: ${parTime.toFixed(2)}ms`);
}

run();
