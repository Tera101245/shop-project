const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../shop.db');
const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('資料庫連接錯誤:', err);
  } else {
    console.log('已連接到 SQLite 資料庫');
    // 若資料庫先前不存在，代表是全新環境，此時需要塞入初始測試資料
    initializeDatabase(!dbExists);
    // 每次啟動都修復 admin / user 的密碼，確保測試帳號一定能登入
    fixDefaultPasswords();
  }
});

// 修復 admin / user 預設密碼（每次啟動時執行）
function fixDefaultPasswords() {
  const bcrypt = require('bcryptjs');
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  db.serialize(() => {
    // 若 admin 帳號已存在，強制更新密碼；若不存在則插入
    db.run(
      `INSERT INTO users (username, password, role) VALUES ('admin', ?, 'ADMIN')
       ON CONFLICT(username) DO UPDATE SET password = ?`,
      [adminHash, adminHash],
      (err) => {
        if (!err) console.log('[修復] admin 密碼已更新為 admin123');
      }
    );

    db.run(
      `INSERT INTO users (username, password, role) VALUES ('user', ?, 'USER')
       ON CONFLICT(username) DO UPDATE SET password = ?`,
      [userHash, userHash],
      (err) => {
        if (!err) console.log('[修復] user 密碼已更新為 user123');
      }
    );
  });
}


function initializeDatabase(isNewDb) {
  // 使用 serialize 確保順序執行
  db.serialize(() => {
    // 建立用戶表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        fullName TEXT,
        phone TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      // 升級既存的資料庫：補足 fullName 與 phone 欄位（略過已存在的錯誤）
      db.run('ALTER TABLE users ADD COLUMN fullName TEXT', () => { });
      db.run('ALTER TABLE users ADD COLUMN phone TEXT', () => { });
    });

    // 建立商品表
    db.run(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        imageUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      // 升級既存的資料庫：補足 imageUrl 欄位（略過已存在的錯誤）
      db.run('ALTER TABLE items ADD COLUMN imageUrl TEXT', () => { });
    });

    // 建立訂單表
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        itemId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        totalPrice REAL NOT NULL,
        note TEXT,
        shippingName TEXT,
        shippingPhone TEXT,
        shippingAddress TEXT,
        status TEXT DEFAULT 'PENDING',
        orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (itemId) REFERENCES items(id)
      )
    `, () => {
      // 自動升級：補足 shipping 欄位（若已存在則略過）
      db.run('ALTER TABLE orders ADD COLUMN shippingName TEXT', () => { });
      db.run('ALTER TABLE orders ADD COLUMN shippingPhone TEXT', () => { });
      db.run('ALTER TABLE orders ADD COLUMN shippingAddress TEXT', () => { });
    });

    if (isNewDb) {
      console.log('偵測到為全新資料庫，正在灌入初始測試資料...');
      const bcrypt = require('bcryptjs');

      // 動態產生正確的 bcrypt hash（密碼：admin123）
      const adminHash = bcrypt.hashSync('admin123', 10);
      const userHash = bcrypt.hashSync('user123', 10);

      // 插入測試數據 - 管理員帳號
      db.run(
        `INSERT OR IGNORE INTO users (username, password, role) 
         VALUES ('admin', ?, 'ADMIN')`,
        [adminHash]
      );

      // 插入測試數據 - 普通用戶帳號
      db.run(
        `INSERT OR IGNORE INTO users (username, password, role) 
         VALUES ('user', ?, 'USER')`,
        [userHash]
      );

      // 插入測試商品
      db.run(
        `INSERT OR IGNORE INTO items (name, description, category, price, stock, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['無線滑鼠', '人體工學無線滑鼠', '滑鼠', 599, 30, 'active']
      );

      db.run(
        `INSERT OR IGNORE INTO items (name, description, category, price, stock, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['無線鍵盤', '藍牙無線鍵盤，舒適鍵程，長效電池', '鍵盤', 899, 15, 'active']
      );

      db.run(
        `INSERT OR IGNORE INTO items (name, description, category, price, stock, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['有線鍵盤', 'USB 有線鍵盤，穩定連線，快速回饋', '鍵盤', 499, 25, 'active']
      );
    } else {
      console.log('資料庫已存在，略過初始測試商品與帳號灌入');
    }

    console.log('資料庫初始化完成');
  });
}

module.exports = db;
