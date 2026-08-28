const express = require('express');
const db = require('../db/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// 建立訂單
router.post('/', verifyToken, (req, res) => {
  const { itemId, quantity, note, shippingName, shippingPhone, shippingAddress } = req.body;
  const userId = req.user.id;

  if (!itemId || !quantity) {
    return res.status(400).json({
      status: 400,
      message: '缺少必要欄位'
    });
  }

  // 檢查商品是否存在且庫存充足
  db.get('SELECT * FROM items WHERE id = ? AND status = "active"', [itemId], (err, item) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (!item) {
      return res.status(404).json({
        status: 404,
        message: '商品不存在或已下架'
      });
    }

    if (item.stock < quantity) {
      return res.status(400).json({
        status: 400,
        message: '庫存不足'
      });
    }

    // 計算總價
    const totalPrice = item.price * quantity;

    // 建立訂單
    db.run(
      `INSERT INTO orders (userId, itemId, quantity, unitPrice, totalPrice, note, shippingName, shippingPhone, shippingAddress, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [userId, itemId, quantity, item.price, totalPrice, note || '', shippingName || '', shippingPhone || '', shippingAddress || ''],
      function (err) {
        if (err) {
          return res.status(500).json({
            status: 500,
            message: '資料庫錯誤'
          });
        }

        res.status(201).json({
          status: 201,
          message: '訂單建立成功',
          data: { id: this.lastID }
        });
      }
    );
  });
});

// 取得我的訂單
router.get('/my', verifyToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT o.*, i.name, i.category 
     FROM orders o 
     JOIN items i ON o.itemId = i.id 
     WHERE o.userId = ? 
     ORDER BY o.orderDate DESC`,
    [userId],
    (err, orders) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: '資料庫錯誤'
        });
      }

      res.json({
        status: 200,
        data: orders
      });
    }
  );
});

// 取消訂單
router.patch('/:id/cancel', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get('SELECT * FROM orders WHERE id = ? AND userId = ?', [id, userId], (err, order) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: '訂單不存在'
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        status: 400,
        message: '只有待確認的訂單才能取消'
      });
    }

    db.run('UPDATE orders SET status = ? WHERE id = ?', ['CANCELLED', id], function (err) {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: '資料庫錯誤'
        });
      }

      res.json({
        status: 200,
        message: '訂單已取消'
      });
    });
  });
});

// 取得所有訂單（管理員）
router.get('/', verifyAdmin, (req, res) => {
  db.all(
    `SELECT o.*, u.username, u.fullName, i.name, i.category 
     FROM orders o 
     JOIN users u ON o.userId = u.id 
     JOIN items i ON o.itemId = i.id 
     ORDER BY o.orderDate DESC`,
    (err, orders) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: '資料庫錯誤'
        });
      }

      res.json({
        status: 200,
        data: orders
      });
    }
  );
});

// 確認訂單（管理員）
router.patch('/:id/approve', verifyAdmin, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: '訂單不存在'
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        status: 400,
        message: '只有待確認的訂單才能確認'
      });
    }

    // 減少庫存
    db.run(
      'UPDATE items SET stock = stock - ? WHERE id = ?',
      [order.quantity, order.itemId],
      (err) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            message: '資料庫錯誤'
          });
        }

        db.run('UPDATE orders SET status = ? WHERE id = ?', ['APPROVED', id], function (err) {
          if (err) {
            return res.status(500).json({
              status: 500,
              message: '資料庫錯誤'
            });
          }

          res.json({
            status: 200,
            message: '訂單已確認'
          });
        });
      }
    );
  });
});

// 退訂（管理員）
router.patch('/:id/reject', verifyAdmin, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: '訂單不存在'
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        status: 400,
        message: '只有待確認的訂單才能退訂'
      });
    }

    db.run('UPDATE orders SET status = ? WHERE id = ?', ['REJECTED', id], function (err) {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: '資料庫錯誤'
        });
      }

      res.json({
        status: 200,
        message: '訂單已退訂'
      });
    });
  });
});

// 出貨（管理員）
router.patch('/:id/ship', verifyAdmin, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: '訂單不存在'
      });
    }

    if (order.status !== 'APPROVED') {
      return res.status(400).json({
        status: 400,
        message: '只有已確認的訂單才能出貨'
      });
    }

    db.run('UPDATE orders SET status = ? WHERE id = ?', ['SHIPPED', id], function (err) {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: '資料庫錯誤'
        });
      }

      res.json({
        status: 200,
        message: '訂單已出貨'
      });
    });
  });
});

module.exports = router;
