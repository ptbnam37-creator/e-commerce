const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../pocketbase/pb_data/data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Fix product image field
  db.get("SELECT fields FROM _collections WHERE name = 'product'", (err, row) => {
    if (err) throw err;
    if (row && row.fields) {
      let fields = JSON.parse(row.fields);
      const imageField = fields.find(f => f.name === 'image');
      if (imageField && imageField.type === 'file') {
        imageField.type = 'json';
        delete imageField.maxSelect;
        delete imageField.maxSize;
        delete imageField.mimeTypes;
        delete imageField.protected;
        delete imageField.thumbs;
        imageField.options = { maxSize: 2000000 };
        
        db.run("UPDATE _collections SET fields = ? WHERE name = 'product'", [JSON.stringify(fields)], function(err) {
          if (err) console.error("Error updating product:", err);
          else console.log("Product schema updated.");
        });
      }
    }
  });

  // Fix color_variants image field
  db.get("SELECT fields FROM _collections WHERE name = 'color_variants'", (err, row) => {
    if (err) throw err;
    if (row && row.fields) {
      let fields = JSON.parse(row.fields);
      const imageField = fields.find(f => f.name === 'image');
      if (imageField && (imageField.type === 'file' || imageField.type === 'json')) {
        imageField.type = 'url';
        delete imageField.maxSelect;
        delete imageField.maxSize;
        delete imageField.mimeTypes;
        delete imageField.protected;
        delete imageField.thumbs;
        delete imageField.options;
        imageField.options = { exceptDomains: [], onlyDomains: [] };
        
        db.run("UPDATE _collections SET fields = ? WHERE name = 'color_variants'", [JSON.stringify(fields)], function(err) {
          if (err) console.error("Error updating color_variants:", err);
          else console.log("Color variants schema updated to url.");
        });
      }
    }
  });
});
