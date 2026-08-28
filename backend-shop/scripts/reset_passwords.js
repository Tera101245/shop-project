const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../shop.db');
const db = new sqlite3.Database(dbPath);

async function run() {
  try {
    const adminHash = bcrypt.hashSync('admin', 10);
    const userHash = bcrypt.hashSync('user', 10);

    db.serialize(() => {
      db.run('UPDATE users SET password = ? WHERE username = ?', [adminHash, 'admin'], function(err) {
        if (err) console.error('更新 admin 密碼錯誤:', err);
        else console.log(`admin 密碼更新: ${this.changes} 行受影響`);
      });

      db.run('UPDATE users SET password = ? WHERE username = ?', [userHash, 'user'], function(err) {
        if (err) console.error('更新 user 密碼錯誤:', err);
        else console.log(`user 密碼更新: ${this.changes} 行受影響`);
      });
    });

    // 等待一小段時間確保更新完成
    setTimeout(() => {
      console.log('密碼重設完成');
      db.close();
    }, 500);
  } catch (e) {
    console.error(e);
    db.close();
    process.exit(1);
  }
}

run();
