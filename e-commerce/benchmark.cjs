const { performance } = require('perf_hooks');

const products = Array.from({ length: 1000000 }, (_, i) => ({
  name: `Product ${i} Name`,
  price: Math.random() * 20000000,
  rating: Math.random() * 5
}));

const searchTerm = "Product 500";
const minPrice = 0;
const maxPrice = 10000000;
const minRating = 2;
const maxRating = 5;

let baselineTotal = 0;
let optimizedTotal = 0;

for (let j = 0; j < 10; j++) {
  // Baseline
  const startBaseline = performance.now();
  const filtered1 = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    const matchesRating = product.rating >= minRating && product.rating <= maxRating;
    return matchesSearch && matchesPrice && matchesRating;
  });
  const endBaseline = performance.now();
  baselineTotal += (endBaseline - startBaseline);

  // Optimized
  const startOptimized = performance.now();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const filtered2 = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(lowerSearchTerm);
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    const matchesRating = product.rating >= minRating && product.rating <= maxRating;
    return matchesSearch && matchesPrice && matchesRating;
  });
  const endOptimized = performance.now();
  optimizedTotal += (endOptimized - startOptimized);
}

console.log(`Baseline avg: ${baselineTotal / 10} ms`);
console.log(`Optimized avg: ${optimizedTotal / 10} ms`);
