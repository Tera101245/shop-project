// clinet 連接後端 API

const API_BASE = 'http://localhost:8080/api';

// apiFetch 自訂 API 工具
// path: 代表 API 路徑, 例如: /items/, /auth/login
// options: 代表 fetch 的設定, 例如: method, body
export async function apiFetch(path, options = {}) {
    // 從 localStorage 讀取 JWT token
    const token = localStorage.getItem('token');

    // 設定預設 headers
    const headers = {
        'Content-Type': 'application/json',
        // 如果外部有傳入其他的 headers 也可以合併進來
        ...(options.headers || {})
    }

    // 如果 token 存在就自動加上 Authorization
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // 呼叫後端 API
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    // 嘗試把轉成 JSON
    const json = await response.json().catch(() => null);

    // 如果 HTTP 狀態不是 2xx 或後端回傳 status >= 400 就拋出錯誤
    if (!response.ok || (json && json.status >= 400)) {
        const errStatus = response.status || json?.status;
        if (errStatus === 401 || errStatus === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        throw new Error(json?.message || `API 錯誤 ${response.status}`);
    }

    // 回傳後端資料
    return json;
}