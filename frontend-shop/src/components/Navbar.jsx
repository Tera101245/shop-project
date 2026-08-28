/**
 * 建立共用導覽列, 讓使用者可以點選切換頁面
 * 
 */

// Link 是 React Router 提供的連結元件
// 使用 Link 切換頁面時, 不會重新整理整個網頁
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

// 匯入 useAuth 取得登入狀態
import { useAuth } from '../state/AuthContext';

function Navbar() {

    // 從 AuthContext 取得登入者的資料與相關方法
    const { user, isLogin, isAdmin, logout } = useAuth();

    // navigate 用來登出後導回首頁
    const navigate = useNavigate();

    // 登出功能
    const handleLogout = () => {
        // 清除登入狀態
        logout();

        // 登出後回首頁
        navigate('/');
    };

    // 購物車數量徽章
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const readCart = () => {
            try {
                const raw = localStorage.getItem('cart');
                const cart = raw ? JSON.parse(raw) : [];
                const sum = cart.reduce((s, c) => s + (c.quantity || 0), 0);
                setCartCount(sum);
            } catch (e) {
                setCartCount(0);
            }
        };

        // 初始讀取
        readCart();

        // 監聽自訂事件與 storage
        const onCart = () => readCart();
        window.addEventListener('cartUpdated', onCart);
        window.addEventListener('storage', onCart);

        return () => {
            window.removeEventListener('cartUpdated', onCart);
            window.removeEventListener('storage', onCart);
        };
    }, []);

    return (
        <header className="navbar">
            {/* 系統名稱, 點擊後回首頁 */}
            <Link to="/" className="brand">
                輕鬆電腦配件線上商城
            </Link>

            {/* 導覽連結 */}
            <nav>
                {/* 所有人都可以看見商品列表 */}
                <Link to="/">商品列表</Link>

                {/* 登入後才能看到我的訂單 */}
                {isLogin && <Link to="/my-orders">我的訂單</Link>}

                {/* 購物車 */}
                <Link to="/cart">購物車{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</Link>

                {/* 管理者才能看到商品管理 */}
                {isLogin && isAdmin && <Link to="/admin/items">商品管理</Link>}

                {/* 管理者才能看到訂單審核 */}
                {isLogin && isAdmin && <Link to="/admin/orders">訂單審核</Link>}

            </nav>

            <div className="user-area">
                {
                    isLogin ? (
                        <>
                            {/* 顯示登入者名稱與角色 */}
                            <span>
                                {user?.fullName} ({user?.role})
                            </span>

                            <button onClick={handleLogout}>
                                登出
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ marginRight: '10px' }}>登入</Link>
                            <Link to="/register">註冊</Link>
                        </>
                    )
                }

            </div>

        </header>
    );
}

export default Navbar;