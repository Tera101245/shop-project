# 線上購物商城後端

完整的 Node.js + Express 後端服務，為線上購物商城提供 API。

## 功能特性

- 用戶認證（JWT Token）
- 商品管理（增刪改查）
- 訂單管理（客戶和管理員）
- SQLite 數據庫
- 密碼加密存儲

## 安裝

```bash
npm install
```

## 運行

```bash
npm start
```

服務器將在 `http://localhost:8080` 啟動

## API 端點

### 認證
- `POST /api/auth/login` - 用戶登入

### 商品
- `GET /api/items` - 取得商品列表（支持搜索和篩選）
- `POST /api/admin/items` - 建立商品（管理員）
- `PATCH /api/admin/items/:id` - 編輯商品（管理員）
- `DELETE /api/admin/items/:id` - 刪除商品（管理員）

### 訂單
- `POST /api/orders` - 建立訂單
- `GET /api/orders/my` - 取得我的訂單
- `PATCH /api/orders/:id/cancel` - 取消訂單
- `GET /api/admin/orders` - 取得所有訂單（管理員）
- `PATCH /api/admin/orders/:id/approve` - 確認訂單（管理員）
- `PATCH /api/admin/orders/:id/reject` - 退訂（管理員）
- `PATCH /api/admin/orders/:id/ship` - 出貨（管理員）
