import { performance } from 'perf_hooks';

const oldVariants = Array.from({ length: 100 }, (_, i) => ({ id: `v${i}` }));
const localRecords = Array.from({ length: 100 }, (_, i) => ({ id: `p${i}` }));

async function simulateDelete(id) {
  return new Promise(resolve => setTimeout(resolve, 5)); // simulate 5ms network latency
}

// Sequential (Baseline)
async function deleteSequential() {
  const start = performance.now();
  for (const v of oldVariants) {
    await simulateDelete(v.id);
  }
  for (const r of localRecords) {
    await simulateDelete(r.id);
  }
  const end = performance.now();
  return end - start;
}

// Concurrent (Optimized)
async function deleteConcurrent() {
  const start = performance.now();
  await Promise.all(oldVariants.map(v => simulateDelete(v.id)));
  await Promise.all(localRecords.map(r => simulateDelete(r.id)));
  const end = performance.now();
  return end - start;
}

async function runBenchmark() {
  const seqTime = await deleteSequential();
  console.log(`Sequential deletion (Baseline): ${seqTime.toFixed(2)} ms`);

  const concTime = await deleteConcurrent();
  console.log(`Concurrent deletion (Optimized): ${concTime.toFixed(2)} ms`);
}

runBenchmark();
