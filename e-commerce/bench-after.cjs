const { performance } = require('perf_hooks');

const cart = Array.from({ length: 10000 }, (_, i) => ({ quantity: i % 5 }));

// simulate useMemo logic, without state changes cart is constant
const start = performance.now();
// First time it runs
let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

// Subsequent runs are cached
for (let i = 0; i < 9999; i++) {
  // cached totalItems used directly
  const cachedTotal = totalItems;
}
const end = performance.now();

console.log(`Time taken: ${end - start} ms`);
