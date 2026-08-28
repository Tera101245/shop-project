# 後端完整文檔

## 📁 項目結構

```
backend-shop/
├── src/
│   ├── db/
│   │   └── database.js          # 資料庫初始化和連接
│   ├── middleware/
│   │   └── auth.js              # JWT 認證和授權中間件
│   └── routes/
│       ├── auth.js              # 認證路由
│       ├── items.js             # 商品路由
│       └── orders.js            # 訂單路由
├── server.js                    # 主服務器入口
├── .env                         # 環境配置
├── package.json                 # 依賴聲明
└── README.md                    # 簡介
```

## 🚀 啟動後端

### 第一次啟動（安裝依賴）
```bash
cd c:\Users\User\backend-shop
npm install
```

### 啟動服務器
```bash
npm start
# 或直接用
node server.js
```

服務器將在 `http://localhost:8080` 運行

## 🔐 測試帳號

| 角色 | 用戶名 | 密碼 |
|------|---------|------|
| 管理員 | admin | admin |
| 普通用戶 | user | user |

## 📡 API 端點完整清單

### 認證 (Authentication)

#### 登入
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}

回應:
{
  "status": 200,
  "message": "登入成功",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  }
}
```

---

### 商品 (Items)

#### 取得商品列表（支持搜索）
```
GET /api/items?keyword=T恤&type=服飾

查詢參數:
- keyword (optional): 搜索商品名稱或描述
- type (optional): 按分類篩選（服飾、電子、家居、食品、其他）

回應:
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "name": "T恤",
      "description": "舒適棉質 T 恤",
      "category": "服飾",
      "price": 299,
      "stock": 50,
      "status": "active",
      "createdAt": "2026-08-17T20:24:00.000Z"
    },
    ...
  ]
}
```

#### 建立商品（需要管理員權限）
```
POST /api/admin/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新商品",
  "description": "商品描述",
  "category": "服飾",
  "price": 499,
  "stock": 100
}

回應:
{
  "status": 201,
  "message": "商品建立成功",
  "data": { "id": 4 }
}
```

#### 編輯商品（需要管理員權限）
```
PATCH /api/admin/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "更新後的商品名",
  "price": 599,
  "stock": 80,
  "status": "active"
}

回應:
{
  "status": 200,
  "message": "商品更新成功"
}
```

#### 刪除商品（需要管理員權限）
```
DELETE /api/admin/items/:id
Authorization: Bearer <token>

回應:
{
  "status": 200,
  "message": "商品刪除成功"
}
```

---

### 訂單 (Orders)

#### 建立訂單（需要登入）
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": 1,
  "quantity": 2,
  "note": "請儘快寄送"
}

回應:
{
  "status": 201,
  "message": "訂單建立成功",
  "data": { "id": 1 }
}
```

#### 取得我的訂單（需要登入）
```
GET /api/orders/my
Authorization: Bearer <token>

回應:
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "itemId": 1,
      "quantity": 2,
      "unitPrice": 299,
      "totalPrice": 598,
      "note": "請儘快寄送",
      "status": "PENDING",
      "orderDate": "2026-08-17T20:24:00.000Z",
      "name": "T恤",
      "category": "服飾"
    },
    ...
  ]
}
```

#### 取消訂單（需要登入）
```
PATCH /api/orders/:id/cancel
Authorization: Bearer <token>

回應:
{
  "status": 200,
  "message": "訂單已取消"
}
```

---

### 訂單管理（Order Management）- 管理員專用

#### 取得所有訂單（需要管理員權限）
```
GET /api/admin/orders
Authorization: Bearer <token>

回應:
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "itemId": 1,
      "quantity": 2,
      "unitPrice": 299,
      "totalPrice": 598,
      "note": "請儘快寄送",
      "status": "PENDING",
      "orderDate": "2026-08-17T20:24:00.000Z",
      "username": "user",
      "name": "T恤",
      "category": "服飾"
    },
    ...
  ]
}
```

#### 確認訂單（需要管理員權限）
```
PATCH /api/admin/orders/:id/approve
Authorization: Bearer <token>

回應:
{
  "status": 200,
  "message": "訂單已確認"
}

說明: 確認訂單後，會自動從庫存中扣除相應的數量
```

#### 退訂（需要管理員權限）
```
PATCH /api/admin/orders/:id/reject
Authorization: Bearer <token>

回應:
{
  "status": 200,
  "message": "訂單已退訂"
}
```

#### 出貨（需要管理員權限）
```
PATCH /api/admin/orders/:id/ship
Authorization: Bearer <token>

回應:
{
  "status": 200,
  "message": "訂單已出貨"
}

說明: 只有已確認（APPROVED）的訂單才能出貨
```

---

## 📊 訂單狀態流程

```
PENDING（待確認）
    ↓
APPROVED（已確認）→ REJECTED（已退訂）
    ↓
SHIPPED（已出貨）

CANCELLED（已取消）- 可從 PENDING 狀態取消
```

## 🔑 JWT Token 使用

所有需要認證的端點都需要在 Header 中提供 JWT Token：

```
Authorization: Bearer <your_token_here>
```

Token 有效期: 24 小時

## 💾 資料庫

- **類型**: SQLite3
- **位置**: `shop.db` (在專案根目錄)
- **表格**:
  - `users` - 用戶帳號
  - `items` - 商品
  - `orders` - 訂單

## 🔧 環境配置 (.env)

```
PORT=8080
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

⚠️ **重要**: 在生產環境中，請修改 `JWT_SECRET` 為更安全的值！

## 📝 前端連接

前端應該設定 API 基礎 URL 為:
```
http://localhost:8080/api
```

這個 URL 應該在前端的 `src/api/client.js` 中設定（看起來已經設定好了）。

## ✅ 測試後端

### 使用 curl 測試登入
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### 使用 curl 取得商品列表
```bash
curl http://localhost:8080/api/items
```

### 使用 Postman
1. 打開 Postman
2. 建立新的 Request
3. 選擇 POST 方法
4. URL: `http://localhost:8080/api/auth/login`
5. Body (raw, JSON):
   ```json
   {
     "username": "admin",
     "password": "admin"
   }
   ```
6. 發送並複製返回的 token
7. 對其他需要認證的端點，在 Headers 中新增:
   - Key: `Authorization`
   - Value: `Bearer <複製的token>`

## 🐛 常見問題

**Q: 無法連接到後端？**
- 確保後端服務器正在運行 (`node server.js`)
- 檢查 PORT 是否正確（預設 8080）
- 確保前端的 API_BASE URL 指向正確的後端地址

**Q: 登入失敗？**
- 確保使用正確的測試帳號 (admin / user，密碼都是對應的帳號)
- 檢查資料庫是否已正確初始化

**Q: 庫存不足錯誤？**
- 訂單數量不能超過商品的剩餘庫存
- 確認訂單後，庫存會自動扣除

---

🎉 後端已完全設置並準備好使用！
