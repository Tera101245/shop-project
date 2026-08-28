/**
 * 路徑:/                   模組:<ItemsPage />             商品列表
 * 路徑:/login              模組:<LoginPage />             登入頁面
 * 路徑:/my-orders          模組:<MyOrdersPage />          我的訂單
 * 路徑:/admin/items        模組:<AdminItemsPage />        商品管理
 * 路徑:/admin/orders       模組:<AdminOrdersPage />       訂單審核
 * 
 * 安裝 React Router
 * 指令 npm install react-router-dom
 */

import { Route, Routes } from "react-router-dom"

// 匯入 Navbar
import Navbar from "./components/Navbar"

// 匯入 ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute';

import ItemsPage from './pages/ItemsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminItemsPage from './pages/AdminItemsPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import CartPage from './pages/CartPage'

function App() {
  return (
    <>
      {/* Navbar 放在 Routers 的外面代表每一頁都可以看得到 */}
      <Navbar />

      <main className="container">
        <Routes>
          <Route path="/" element={<ItemsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 我的訂單：需要登入 */}
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />

          {/* 購物車（允許未登入檢視，結帳時會導向登入） */}
          <Route path="/cart" element={<CartPage />} />

          {/* 項目管理：需要管理者 */}
          <Route
            path="/admin/items"
            element={
              <ProtectedRoute adminOnly>
                <AdminItemsPage />
              </ProtectedRoute>
            }
          />

          {/* 訂單審核：需要管理者 */}
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute adminOnly>
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <span>📧 客服信箱：123456@gmail.com</span>
          <span className="footer-divider">|</span>
          <span>📞 客服電話：02-12345678</span>
        </div>
      </footer>
    </>
  )

}

export default App