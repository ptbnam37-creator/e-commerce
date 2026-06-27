const fs = require('fs');
async function testTikiDetail() {
  try {
    const res = await fetch('https://tiki.vn/api/v2/products?limit=5&category=1789', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await res.json();
    const productId = data.data[0].id;
    
    const detailRes = await fetch('https://tiki.vn/api/v2/products/' + productId, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const detail = await detailRes.json();
    
    if (detail.configurable_products) {
       console.log('Variants images keys:', Object.keys(detail.configurable_products[0].images[0] || {}));
       console.log('First image object:', detail.configurable_products[0].images[0]);
    }
  } catch (err) {
    console.error('Tiki error:', err.message);
  }
}
testTikiDetail();
