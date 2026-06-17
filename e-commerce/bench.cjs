const { performance } = require('perf_hooks');

const cart = Array.from({ length: 10000 }, (_, i) => ({ quantity: i % 5 }));

const start = performance.now();
for (let i = 0; i < 10000; i++) {
  cart.reduce((sum, item) => sum + item.quantity, 0);
}
const end = performance.now();

console.log(`Time taken: ${end - start} ms`);
