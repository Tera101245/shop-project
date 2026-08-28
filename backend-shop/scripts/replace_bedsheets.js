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
  function finish() {
    db.close((closeErr) => {
      if (closeErr) console.error('關閉資料庫時發生錯誤:', closeErr);
      else console.log('replace_bedsheets 完成並已關閉資料庫連線。');
    });
  }

  db.get("SELECT id FROM items WHERE name = ? LIMIT 1", ['床單組'], (err, row) => {
    if (err) {
      console.error('查詢錯誤:', err);
      // still attempt to insert wired keyboard
      checkInsertWired();
      return;
    }

    if (row) {
      const id = row.id;
      db.run(
        `UPDATE items SET name = ?, description = ?, category = ?, price = ?, stock = ?, status = ? WHERE id = ?`,
        ['無線鍵盤', '藍牙無線鍵盤，舒適鍵程，長效電池', '電子', 899, 15, 'active', id],
        function (upErr) {
          if (upErr) console.error('更新錯誤:', upErr);
          else console.log(`已將 items.id=${id} 的 '床單組' 更新為 '無線鍵盤'`);
          // after update, proceed to insert wired keyboard check
          checkInsertWired();
        }
      );
    } else {
      console.log("資料庫中找不到名稱為 '床單組' 的項目，跳過更新。");
      checkInsertWired();
    }
  });

  function checkInsertWired() {
    db.get("SELECT id FROM items WHERE name = ? LIMIT 1", ['有線鍵盤'], (err2, row2) => {
      if (err2) {
        console.error('查詢錯誤:', err2);
        finish();
        return;
      }

      if (row2) {
        console.log("'有線鍵盤' 已存在，未重複新增。");
        finish();
      } else {
        db.run(
          `INSERT INTO items (name, description, category, price, stock, status) VALUES (?, ?, ?, ?, ?, ?)`,
          ['有線鍵盤', 'USB 有線鍵盤，穩定連線，快速回饋', '電子', 499, 25, 'active'],
          function (insErr) {
            if (insErr) console.error('插入錯誤:', insErr);
            else console.log("已新增 '有線鍵盤' 到 items。");
            finish();
          }
        );
      }
    });
  }
});

// 若從 CLI 執行，給出簡單說明
if (require.main === module) {
  console.log('replace_bedsheets.js 執行完成（如有更新會顯示訊息）。');
}
