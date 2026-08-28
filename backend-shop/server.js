require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 匯入路由
const authRoutes = require('./src/routes/auth');
const itemsRoutes = require('./src/routes/items');
const ordersRoutes = require('./src/routes/orders');

// 初始化資料庫
const db = require('./src/db/database');

const app = express();
const PORT = process.env.PORT || 8080;

// 中間件
app.use(cors());
app.use(express.json());

// 日誌中間件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/admin/items', itemsRoutes); // 重用 items 路由，中間件會驗證管理員身份
app.use('/api/orders', ordersRoutes);
app.use('/api/admin/orders', ordersRoutes); // 重用 orders 路由，中間件會驗證管理員身份

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 錯誤處理
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: '端點不存在'
  });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`🚀 服務器已啟動: http://localhost:${PORT}`);
  console.log(`測試帳號 - 管理員: admin / admin`);
  console.log(`測試帳號 - 用戶: user / user`);
});
