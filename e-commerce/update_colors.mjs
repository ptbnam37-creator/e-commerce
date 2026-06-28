import PocketBase from 'pocketbase';
const pb = new PocketBase('https://e-commerce-backend-73cc.onrender.com');

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
    console.log('Fetching all products from PocketBase...');
    const records = await pb.collection('product').getFullList({
      batch: 100,
    });
    console.log(`Found ${records.length} products.`);

    let updatedCount = 0;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`Processing ${i + 1}/${records.length}: ${record.name}`);
      
      if (record.colors && record.colors.length > 0) {
        console.log('  Colors already exist, skipping.');
        continue;
      }

      try {
        // Search Tiki for product
        const searchUrl = `https://tiki.vn/api/v2/products?q=${encodeURIComponent(record.name)}&limit=1`;
        const searchData = await fetchWithRetry(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        if (!searchData.data || searchData.data.length === 0) {
          console.log('  Could not find product on Tiki.');
          continue;
        }
        
        const tikiId = searchData.data[0].id;
        
        // Fetch product details
        const detailUrl = `https://tiki.vn/api/v2/products/${tikiId}`;
        const detailData = await fetchWithRetry(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        let colors = [];
        
        if (detailData.configurable_products && detailData.configurable_products.length > 0) {
          // Some products have colors in configurable_products
          const colorMap = new Map();
          detailData.configurable_products.forEach(cp => {
            const colorName = cp.option1 || 'Mặc định';
            if (!colorMap.has(colorName)) {
              let imgUrl = cp.thumbnail_url;
              if (cp.images && cp.images.length > 0 && cp.images[0].large_url) {
                imgUrl = cp.images[0].large_url;
              }
              colorMap.set(colorName, {
                id: cp.id.toString(),
                name: colorName,
                image: imgUrl
              });
            }
          });
          colors = Array.from(colorMap.values());
        } else if (detailData.option_color && detailData.option_color.length > 0) {
          // Some have option_color
          colors = detailData.option_color.map((opt, idx) => ({
            id: 'c' + idx,
            name: opt.display_value,
            image: detailData.thumbnail_url // Default image as fallback if option_color doesn't have image
          }));
        } else {
          // If no variants found, just generate one default variant
          colors = [{
            id: 'default',
            name: 'Mặc định',
            image: typeof record.image === 'string' ? record.image : (record.image[0] || detailData.thumbnail_url)
          }];
        }
        
        // Ensure image paths are absolute HTTP URLs if from Tiki
        colors = colors.map(c => ({
          ...c,
          image: c.image && c.image.startsWith('http') ? c.image : (detailData.thumbnail_url || '')
        }));
        
        // Update PocketBase
        await pb.collection('product').update(record.id, {
          colors: colors
        });
        
        console.log(`  Updated with ${colors.length} colors.`);
        updatedCount++;
        
        // small delay to prevent rate limit
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`  Error processing product: ${err.message}`);
      }
    }
    
    console.log(`Finished! Updated ${updatedCount} products.`);
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

run();
