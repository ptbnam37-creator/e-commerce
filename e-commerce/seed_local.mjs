import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function run() {
  try {
    const adminAuth = await pb.admins.authWithPassword('phuongnam098@gmail.com', 'Nam21102004@'); // just in case
  } catch(e) {}
  
  try {
    console.log('Clearing local products and color variants...');
    const oldVariants = await pb.collection('color_variants').getFullList();
    await Promise.all(oldVariants.map(v => pb.collection('color_variants').delete(v.id)));

    const localRecords = await pb.collection('product').getFullList();
    await Promise.all(localRecords.map(r => pb.collection('product').delete(r.id)));
    console.log('Local products and variants cleared.');

    console.log('Fetching smartphone list from Tiki...');
    let items = [];
    let page = 1;
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    
    while (items.length < 100) {
      const listData = await fetchWithRetry(`https://tiki.vn/api/personalish/v1/blocks/listings?limit=40&category=1795&page=${page}`, { headers });
      if (!listData.data || listData.data.length === 0) break;
      items = items.concat(listData.data);
      page++;
    }
    items = items.slice(0, 100);
    
    let insertedCount = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Processing ${i + 1}/100: ${item.name}`);
      
      try {
        const detailData = await fetchWithRetry(`https://tiki.vn/api/v2/products/${item.id}`, { headers });
        let colors = [];
        if (detailData.configurable_products && detailData.configurable_products.length > 0) {
          const colorMap = new Map();
          detailData.configurable_products.forEach(cp => {
            const colorName = cp.option1 || 'Mặc định';
            if (!colorMap.has(colorName)) {
              let imgUrl = cp.thumbnail_url;
              if (cp.images && cp.images.length > 0 && cp.images[0].large_url) {
                imgUrl = cp.images[0].large_url;
              }
              colorMap.set(colorName, { id: cp.id.toString(), name: colorName, image: imgUrl });
            }
          });
          colors = Array.from(colorMap.values());
        } else if (detailData.option_color && detailData.option_color.length > 0) {
          colors = detailData.option_color.map((opt, idx) => ({
            id: 'c' + idx,
            name: opt.display_value,
            image: detailData.thumbnail_url
          }));
        } else {
          colors = [{ id: 'default', name: 'Mặc định', image: detailData.thumbnail_url }];
        }
        
        colors = colors.map(c => ({
          ...c,
          image: c.image && c.image.startsWith('http') ? c.image : (detailData.thumbnail_url || '')
        }));
        
        const pbItem = {
          name: item.name,
          price: item.price,
          brand: item.brand_name || 'Tiki',
          rating: item.rating_average || 5,
          description: detailData.short_description || item.name,
          image: [item.thumbnail_url],
        };
        
        const createdRecord = await pb.collection('product').create(pbItem);
        
        for (const color of colors) {
          try {
            await pb.collection('color_variants').create({
              productId: createdRecord.id,
              color: color.name,
              image: color.image
            });
          } catch(err) {
            console.error(`  Error creating color variant ${color.name}:`, err.message);
          }
        }
        
        insertedCount++;
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`  Error: ${err.message}`);
      }
    }
    
    console.log(`Finished! Inserted ${insertedCount} products into local PocketBase.`);
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

run();
