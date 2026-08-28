// 保護會員頁面與管理者頁面
// 未登入者不可以進入我的預約
// 一般會員不能進入管理者頁面

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../state/AuthContext';

function ProtectedRoute({ children, adminOnly = false}) {

    const {isLogin, isAdmin, user} = useAuth();

    const location = useLocation();

    // 如果沒有登入就導回登入頁，並記住來源位置
    if(!isLogin) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    // 如果此頁面需要管理者角色, 但是目前的登入角色不是管理者, 就導回首頁
    console.log(adminOnly, !isAdmin, user);
    if(adminOnly && !isAdmin) {
        return <Navigate to="/login" replace />
    }

    return children;
}

export default ProtectedRoute;
