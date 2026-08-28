# React + Vite 線上購物商城

這是一個使用 React + Vite 建構的線上購物商城應用程式。使用者可以瀏覽商品、購物、查詢訂單，管理者可以管理商品和訂單。

## 主要功能

- 🛍️ 商品瀏覽和搜尋
- 🛒 購物車和訂單管理
- 👤 使用者登入和身份驗證
- 👨‍💼 管理者商品和訂單管理介面
- 📱 響應式設計

## 路由結構

- `/` - 商品列表頁面
- `/login` - 使用者登入
- `/my-orders` - 我的訂單（需登入）
- `/admin/items` - 商品管理（需管理者權限）
- `/admin/orders` - 訂單審核（需管理者權限）

## 技術棧

- React 19
- React Router 7
- Vite 8
- CSS3

## 開發指令

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建構生成版本
npm run build

# 預覽構建版本
npm run preview
```
