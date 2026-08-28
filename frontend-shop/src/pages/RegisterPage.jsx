import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const { register, login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // 前端驗證
        if (!username || !password || !fullName) {
            setError("請填寫所有必填欄位（帳號、密碼、姓名）");
            return;
        }

        if (username.length < 3 || username.length > 50) {
            setError("帳號長度必須介於 3 到 50 個字元");
            return;
        }

        if (password.length < 6) {
            setError("密碼長度至少需要 6 個字元");
            return;
        }

        if (password !== confirmPassword) {
            setError("密碼與確認密碼不一致");
            return;
        }

        setLoading(true);
        try {
            // 呼叫註冊 API
            await register(username, password, fullName, phone || null);
            setSuccess("註冊成功！正在自動登入...");

            // 自動為使用者登入
            setTimeout(async () => {
                try {
                    await login(username, password);
                    navigate("/");
                } catch (loginErr) {
                    setError("註冊成功，但自動登入失敗，請手動登入：" + loginErr.message);
                    setLoading(false);
                }
            }, 1500);

        } catch (err) {
            setError("註冊失敗：" + (err.message || "未知錯誤"));
            setLoading(false);
        }
    };

    return (
        <section className="panel narrow">
            <h1>註冊帳號</h1>
            <p className="hint">請填寫以下資訊以建立您的專屬帳號</p>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert">{success}</div>}

            <form onSubmit={handleSubmit} className="form">
                <label>帳號 (必填，長度 3 - 50)</label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="請輸入帳號"
                    disabled={loading}
                    required
                />

                <label>姓名 (必填)</label>
                <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="請輸入您的真實姓名"
                    disabled={loading}
                    required
                />

                <label>電話號碼 (選填)</label>
                <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="請輸入您的聯絡電話"
                    disabled={loading}
                />

                <label>密碼 (必填，至少 6 個字元)</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    disabled={loading}
                    required
                />

                <label>確認密碼 (必填)</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="請再次輸入密碼"
                    disabled={loading}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "處理中..." : "註冊"}
                </button>
            </form>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <span className="hint">已經有帳號了？ </span>
                <Link to="/login" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>
                    立即登入
                </Link>
            </div>
        </section>
    );
}

export default RegisterPage;
