const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../shop.db');
const db = new sqlite3.Database(dbPath);

function run() {
  try {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const userHash = bcrypt.hashSync('user123', 10);

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

    setTimeout(() => {
      console.log('密碼重設為 admin123 / user123 完成');
      db.close();
    }, 500);
  } catch (e) {
    console.error(e);
    db.close();
    process.exit(1);
  }
}

run();
