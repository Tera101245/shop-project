// useEffect 頁面載入時執行某些動作
// useState 是 React 的狀態管理
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

// 匯入自訂 API 工具
import { apiFetch } from "../api/client";

// 取得登入狀態
import { useAuth } from '../state/AuthContext';

function ItemsPage() {
  // isLogin 用來判斷是否已登入
  const { isLogin } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // orderForms 用來記錄每一個 item 的購物表單
  // 格式大概是：
  // {
  //   1: { quantity: 1, note: '...' },
  //   2: { quantity: 1, note: '...' }
  // }
  const [orderForms, setOrderForms] = useState({});

  // 載入商品列表
  const loadItems = async () => {
    const params = new URLSearchParams();

    if (keyword) {
      params.append('keyword', keyword);
    }

    if (type) {
      params.append('type', type);
    }

    const queryString = params.toString();
    const path = queryString ? `/items?${queryString}` : '/items';

    const result = await apiFetch(path);
    setItems(result.data);
  };

  // 頁面第一次載入時讀取項目
  useEffect(() => {
    loadItems().catch((err) => setMessage(err.message));
  }, []);

  // 更新某一個 item 的某一個表單欄位
  const updateForm = (itemId, field, value) => {
    setOrderForms((prev) => ({
      ...prev,

      // 用 itemId 區分不同卡片的表單
      [itemId]: {
        ...(prev[itemId] || {}),

        // 動態更新 quantity 或 note
        [field]: value,
      },
    }));
  };

  // 加入購物車（改為本地暫存購物車，使用 localStorage）
  const addToCart = (itemId) => {
    setMessage('');

    const form = orderForms[itemId] || {};
    const quantity = form.quantity || 1;
    const note = form.note || '';

    const item = items.find((i) => i.id === itemId);
    if (!item) {
      setMessage('找不到商品');
      return;
    }

    // 讀取現有購物車
    const raw = localStorage.getItem('cart');
    const cart = raw ? JSON.parse(raw) : [];

    // 如果已存在相同商品，合併數量
    const existing = cart.find((c) => c.itemId === itemId);
    if (existing) {
      existing.quantity = Math.min(item.stock, (existing.quantity || 0) + quantity);
      existing.note = note;
    } else {
      cart.push({
        itemId,
        name: item.name,
        unitPrice: item.price,
        quantity,
        note,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // 通知其他元件更新購物車顯示
    try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) { }

    // 不再直接跳頁，改為跳入已加入購物車的小視窗
    setShowToast(true);

    // 2.5秒後自動關閉
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // NOTE: 測試購買已移除，改為加入購物車流程

  return (
    <section>
      <h1>商品列表</h1>

      <div className="toolbar">
        <input
          placeholder="關鍵字，例如無線滑鼠"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">全部類型</option>
          <option value="滑鼠">滑鼠</option>
          <option value="鍵盤">鍵盤</option>
          <option value="麥克風">麥克風</option>
          <option value="螢幕">螢幕</option>
          <option value="耳機">耳機</option>
          <option value="其他">其他</option>
        </select>

        <button onClick={loadItems}>查詢</button>
      </div>

      {message && <div className="alert">{message}</div>}

      <div className="grid">
        {items.map((item) => {
          // 取得這個 item 對應的表單
          const form = orderForms[item.id] || {};

          return (
            <article className="card" key={item.id}>
              {(item.imageUrl || item.image) && (
                <img
                  src={item.imageUrl || item.image}
                  alt={item.name}
                />
              )}

              <div className="card-body">
                <h2>{item.name}</h2>

                <p>
                  {item.type}｜庫存: {item.stock}
                </p>

                <p>{item.description}</p>

                <p className="price">
                  NT$ {item.price}
                </p>

                <span className="badge">
                  {item.status}
                </span>
              </div>

              {/* 如果有庫存，顯示加入購物車表單（未登入也可加入購物車） */}
              {item.stock > 0 ? (
                <div className="purchase-box">
                  <label>數量</label>
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={form.quantity || 1}
                    onChange={(e) =>
                      updateForm(item.id, 'quantity', Number(e.target.value))
                    }
                  />

                  <label>備註</label>
                  <input
                    value={form.note || ''}
                    onChange={(e) =>
                      updateForm(item.id, 'note', e.target.value)
                    }
                    placeholder="例如選擇顏色"
                  />

                  <button onClick={() => addToCart(item.id)}>
                    加入購物車
                  </button>
                  {!isLogin && (
                    <p className="hint">未登入：結帳時會要求登入</p>
                  )}
                </div>
              ) : (
                <p className="hint">商品缺貨</p>
              )}
            </article>
          );
        })}
      </div>

      {/* 已加入購物車的精美小彈窗 */}
      {showToast && (
        <div className="toast-overlay" onClick={() => setShowToast(false)}>
          <div className="toast-content" onClick={(e) => e.stopPropagation()}>
            <div className="toast-icon">✓</div>
            <div className="toast-text">已加入購物車!</div>
            <button className="toast-btn" onClick={() => setShowToast(false)}>
              確定
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ItemsPage;