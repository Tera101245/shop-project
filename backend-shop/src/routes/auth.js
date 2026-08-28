const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();

// 登入端點
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: 400,
      message: '缺少用戶名或密碼'
    });
  }

  // 從資料庫查詢用戶
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: '用戶名或密碼錯誤'
      });
    }

    // 驗證密碼
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: '驗證錯誤'
        });
      }

      if (!isMatch) {
        return res.status(401).json({
          status: 401,
          message: '用戶名或密碼錯誤'
        });
      }

      // 生成 JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        status: 200,
        message: '登入成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            fullName: user.fullName || user.username,
            phone: user.phone || null
          }
        }
      });
    });
  });
});

// 註冊端點
router.post('/register', (req, res) => {
  const { username, password, fullName, phone } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: 400,
      message: '缺少帳號或密碼'
    });
  }

  // 檢查帳號是否已存在
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (user) {
      return res.status(400).json({
        status: 400,
        message: '帳號已存在'
      });
    }

    // 加密密碼
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: '密碼加密失敗'
        });
      }

      // 嘗試寫入含姓名、電話的資料，若欄位不存在則降級寫入基本資料
      db.run(
        'INSERT INTO users (username, password, role, fullName, phone) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, 'USER', fullName || username, phone || null],
        function (err) {
          if (err) {
            // 如果欄位不存在/發生錯誤，則降級回只有 username, password
            db.run(
              'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
              [username, hashedPassword, 'USER'],
              function (err2) {
                if (err2) {
                  return res.status(500).json({
                    status: 500,
                    message: '資料庫寫入失敗：' + err2.message
                  });
                }

                return res.status(201).json({
                  status: 201,
                  message: '註冊成功',
                  data: {
                    user: {
                      id: this.lastID,
                      username,
                      role: 'USER',
                      fullName: username,
                      phone: null
                    }
                  }
                });
              }
            );
            return;
          }

          res.status(201).json({
            status: 201,
            message: '註冊成功',
            data: {
              user: {
                id: this.lastID,
                username,
                role: 'USER',
                fullName: fullName || username,
                phone: phone || null
              }
            }
          });
        }
      );
    });
  });
});

module.exports = router;
