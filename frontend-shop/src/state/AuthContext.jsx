/**
 * 建立全系統共用的登入狀態管理
 * createContext: 建立 Context
 * useContext: 使用 Context
 * useEffect: 當 token 或 user 改變時同步更新到 localStorage
 * useMemo: 避免 value 每次都重新建立
 * useState: 儲存登入狀態
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";

// 匯入 API 工具
import { apiFetch } from "../api/client";

// 建立 AuthContext
const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    // 從 localStorage 讀取 user
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    });

    // 從 localStorage 讀取 token
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    // token 改變時同步更新 localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // user 改變時同步更新 localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // login 方法負責呼叫後端都入 API
    const login = async (username, password) => {

        const result = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username, password
            })
        });

        // 後端回傳 token
        setToken(result.data.token);

        // 後端回傳 user
        setUser(result.data.user);

        // 回傳 user 給 LoginPage 進行判斷
        return result.data.user;
    };

    // register 方法負責呼叫後端註冊 API
    const register = async (username, password, fullName, phone) => {
        const result = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username, password, fullName, phone
            })
        });
        return result;
    };

    // logout 方法負責登出
    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const value = useMemo(() => ({
        user,
        token,
        // 只有 token 與 user 都存在才視為已登入
        isLogin: !!token && !!user,
        // user.role 是 ADMIN 就代表管理者 
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
    }),
        [user, token]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// 自訂 Hook 讓其他元件可以使用登入狀態
export function useAuth() {
    return useContext(AuthContext);
}

