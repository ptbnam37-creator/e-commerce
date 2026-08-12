import { performance } from 'perf_hooks';

const mockDelay = 10; // 10ms per network request

const pb = {
  collection: (name) => ({
    getFullList: async () => {
      await new Promise(r => setTimeout(r, mockDelay));
      return Array.from({ length: 50 }).map((_, i) => ({ id: `${name}_${i}` }));
    },
    delete: async (id) => {
      await new Promise(r => setTimeout(r, mockDelay));
    }
  })
};

async function benchmarkOld() {
  const start = performance.now();
  const oldVariants = await pb.collection('color_variants').getFullList();
  for (const v of oldVariants) {
    await pb.collection('color_variants').delete(v.id);
  }
  const localRecords = await pb.collection('product').getFullList();
  for (const r of localRecords) {
    await pb.collection('product').delete(r.id);
  }
  return performance.now() - start;
}

async function benchmarkNew() {
  const start = performance.now();
  const oldVariants = await pb.collection('color_variants').getFullList();
  await Promise.all(oldVariants.map(v => pb.collection('color_variants').delete(v.id)));

  const localRecords = await pb.collection('product').getFullList();
  await Promise.all(localRecords.map(r => pb.collection('product').delete(r.id)));
  return performance.now() - start;
}

async function run() {
  console.log("Running baseline (sequential)...");
  const oldTime = await benchmarkOld();
  console.log("Running optimized (Promise.all)...");
  const newTime = await benchmarkNew();

  console.log(`Baseline avg: ${oldTime.toFixed(2)} ms`);
  console.log(`Optimized avg: ${newTime.toFixed(2)} ms`);
  console.log(`Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}%`);
}

run();