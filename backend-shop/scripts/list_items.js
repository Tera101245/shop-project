const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'shop.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法打開資料庫:', err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.all('SELECT id, name, description, category, price, stock FROM items ORDER BY id', (err, rows) => {
    if (err) {
      console.error('查詢錯誤:', err);
      db.close();
      return;
    }

    console.log('--- items 列表 ---');
    rows.forEach(r => {
      console.log(`${r.id}\t${r.name}\t| ${r.category} | NT$ ${r.price} | 庫存: ${r.stock}`);
    });
    console.log('--- 共', rows.length, '筆 ---');
    db.close();
  });
});
