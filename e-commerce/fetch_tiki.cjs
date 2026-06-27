const fs = require('fs');
async function test() {
  const res = await fetch('https://tiki.vn/api/v2/products/279411767', { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const data = await res.json();
  fs.writeFileSync('tiki_product.json', JSON.stringify(data, null, 2));
}
test();
