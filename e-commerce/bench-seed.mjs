import PocketBase from 'pocketbase';
import { performance } from 'perf_hooks';

// Setup mock PocketBase
class MockCollection {
  constructor(name, delay) {
    this.name = name;
    this.delay = delay;
    this.idCounter = 1;
  }

  async create(data) {
    await new Promise(r => setTimeout(r, this.delay));
    return { ...data, id: `id_${this.idCounter++}` };
  }
}

class MockPocketBase {
  collection(name) {
    // Simulate ~10ms network latency
    return new MockCollection(name, 10);
  }
}

const pb = new MockPocketBase();

// Mock data
const mockItems = Array.from({ length: 20 }, (_, i) => ({
  name: `Product ${i}`,
  price: 1000 + i,
  thumbnail_url: `url_${i}`
}));

const mockColors = Array.from({ length: 5 }, (_, i) => ({
  name: `Color ${i}`,
  image: `img_${i}`
}));

async function benchmarkBaseline() {
  console.log('Running Baseline Benchmark...');
  const start = performance.now();

  for (const item of mockItems) {
    const createdRecord = await pb.collection('product').create({
      name: item.name
    });

    // Baseline: N+1 sequential creates
    for (const color of mockColors) {
      await pb.collection('color_variants').create({
        productId: createdRecord.id,
        color: color.name,
      });
    }
  }

  const end = performance.now();
  console.log(`Baseline time: ${(end - start).toFixed(2)} ms`);
  return end - start;
}

async function benchmarkOptimized() {
  console.log('\nRunning Optimized Benchmark...');
  const start = performance.now();

  for (const item of mockItems) {
    const createdRecord = await pb.collection('product').create({
      name: item.name
    });

    // Optimized: Promise.all for concurrent creates
    const colorPromises = mockColors.map(color =>
      pb.collection('color_variants').create({
        productId: createdRecord.id,
        color: color.name,
      })
    );
    await Promise.all(colorPromises);
  }

  const end = performance.now();
  console.log(`Optimized time: ${(end - start).toFixed(2)} ms`);
  return end - start;
}

async function run() {
  const baseTime = await benchmarkBaseline();
  const optTime = await benchmarkOptimized();

  console.log(`\nImprovement: ${((baseTime - optTime) / baseTime * 100).toFixed(2)}% faster`);
}

run();
