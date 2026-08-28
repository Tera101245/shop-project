const express = require('express');
const db = require('../db/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// 取得商品列表（支持搜索和篩選）
router.get('/', (req, res) => {
  const { keyword, type } = req.query;

  let query = 'SELECT * FROM items WHERE status = "active"';
  const params = [];

  if (keyword) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (type) {
    query += ' AND category = ?';
    params.push(type);
  }

  db.all(query, params, (err, items) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    res.json({
      status: 200,
      data: items
    });
  });
});

// 取得單個商品
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (!item) {
      return res.status(404).json({
        status: 404,
        message: '商品不存在'
      });
    }

    res.json({
      status: 200,
      data: item
    });
  });
});

// 建立商品（管理員）
router.post('/', verifyAdmin, (req, res) => {
  const { name, description, category, price, stock, imageUrl } = req.body;

  if (!name || !category || !price || stock === undefined) {
    return res.status(400).json({
      status: 400,
      message: '缺少必要欄位'
    });
  }

  db.run(
    `INSERT INTO items (name, description, category, price, stock, imageUrl, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [name, description || '', category, price, stock, imageUrl || null],
    function (err) {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: '資料庫錯誤'
        });
      }

      res.status(201).json({
        status: 201,
        message: '商品建立成功',
        data: { id: this.lastID }
      });
    }
  );
});

// 編輯商品（管理員）
// 編輯商品（管理員）- 支持 PUT 與 PATCH 方法
const updateItem = (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, stock, status, imageUrl } = req.body;

  let query = 'UPDATE items SET ';
  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push('name = ?');
    params.push(name);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    params.push(category);
  }
  if (price !== undefined) {
    updates.push('price = ?');
    params.push(price);
  }
  if (stock !== undefined) {
    updates.push('stock = ?');
    params.push(stock);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }
  if (imageUrl !== undefined) {
    updates.push('imageUrl = ?');
    params.push(imageUrl);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      status: 400,
      message: '沒有欄位需要更新'
    });
  }

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        status: 404,
        message: '商品不存在'
      });
    }

    res.json({
      status: 200,
      message: '商品更新成功'
    });
  });
};

router.put('/:id', verifyAdmin, updateItem);
router.patch('/:id', verifyAdmin, updateItem);

// 刪除商品（管理員）
router.delete('/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM items WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: '資料庫錯誤'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        status: 404,
        message: '商品不存在'
      });
    }

    res.json({
      status: 200,
      message: '商品刪除成功'
    });
  });
});

module.exports = router;
