const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'shop.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('無法打開資料庫:', err);
    process.exit(1);
  }
});

function normalizeName(name) {
  return name.trim().toLowerCase();
}

db.serialize(() => {
  db.all('SELECT id, name FROM items ORDER BY id', (err, rows) => {
    if (err) {
      console.error('查詢錯誤:', err);
      db.close();
      return;
    }

    const seen = new Map();
    const duplicates = [];

    for (const r of rows) {
      const key = normalizeName(r.name);
      if (!seen.has(key)) {
        seen.set(key, r.id);
      } else {
        duplicates.push({ keepId: seen.get(key), removeId: r.id, name: r.name });
      }
    }

    if (duplicates.length === 0) {
      console.log('未發現重複名稱的商品。');
      db.close();
      return;
    }

    console.log('發現重複商品，將移除以下項目（保留最早的 id）：');
    duplicates.forEach(d => console.log(`- 刪除 id=${d.removeId} (${d.name}), 保留 id=${d.keepId}`));

    // 批次刪除
    const stmt = db.prepare('DELETE FROM items WHERE id = ?');
    db.serialize(() => {
      for (const d of duplicates) {
        stmt.run(d.removeId, function (err2) {
          if (err2) console.error(`刪除 id=${d.removeId} 時發生錯誤:`, err2);
          else console.log(`已刪除 id=${d.removeId}`);
        });
      }
      stmt.finalize(() => {
        console.log('重複商品刪除完成。');
        db.close();
      });
    });
  });
});
