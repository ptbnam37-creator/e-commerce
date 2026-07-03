import PocketBase from 'pocketbase';

const pb = new PocketBase('https://e-commerce-backend-73cc.onrender.com');

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function run() {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*'
    };

    console.log('Fetching smartphone list from Tiki...');
    const listData = await fetchWithRetry('https://tiki.vn/api/personalish/v1/blocks/listings?limit=100&category=1795', { headers });
    const items = listData.data.slice(0, 100);
    console.log(`Fetched ${items.length} products.`);

    let count = 0;
    for (const item of items) {
      if (count >= 1) break; // test with 1 product first
      
      console.log(`Fetching details for ${item.id} - ${item.name}...`);
      const detail = await fetchWithRetry(`https://tiki.vn/api/v2/products/${item.id}`, { headers });
      
      console.log('Detail configurable options:', JSON.stringify(detail.configurable_options, null, 2));
      if (detail.configurable_products && detail.configurable_products.length > 0) {
        console.log('First configurable product:', JSON.stringify(detail.configurable_products[0], null, 2));
      }
      console.log('Images:', detail.images?.map(i => i.base_url));
      
      count++;
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
