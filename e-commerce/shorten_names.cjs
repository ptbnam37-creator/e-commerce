const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../pocketbase/pb_data/data.db');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Tables:", rows.map(r => r.name).join(", "));
  
  if (rows.find(r => r.name === 'product')) {
    db.all("SELECT id, name FROM product", (err, products) => {
      if (err) {
        console.error(err);
        return;
      }
      
      let updatedCount = 0;
      products.forEach(row => {
        let newName = row.name;
        
        // Trim first to remove leading spaces
        newName = newName.trim();
        
        // Remove "Điện thoại " or "điện thoại "
        newName = newName.replace(/^[đĐ]i[ệe]n tho[ạa]i\s+/i, '');
        
        // Remove everything after a dash that is likely marketing fluff
        if (newName.includes(' - ')) {
          newName = newName.split(' - ')[0];
        }
        
        // Remove everything after a comma
        if (newName.includes(',')) {
          newName = newName.split(',')[0];
        }
        
        // Remove everything after a plus
        if (newName.includes(' + ')) {
          newName = newName.split(' + ')[0];
        }
        
        // Trim again just in case
        newName = newName.trim();
        
        if (newName !== row.name) {
          console.log(`Update: "${row.name}" -> "${newName}"`);
          db.run("UPDATE product SET name = ? WHERE id = ?", [newName, row.id]);
          updatedCount++;
        }
      });
      console.log(`Updated ${updatedCount} products.`);
    });
  }
});
