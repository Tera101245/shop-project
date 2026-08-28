import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../state/AuthContext';

function CartPage() {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const { isLogin } = useAuth();
  const navigate = useNavigate();

  // 控制收件資料彈窗的開關
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // 收件人資料表單
  const [shippingForm, setShippingForm] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [shippingError, setShippingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('cart');
    setCart(raw ? JSON.parse(raw) : []);
  }, []);

  const removeItem = (itemId) => {
    const next = cart.filter((c) => c.itemId !== itemId);
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
    try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) { }
  };

  const updateQty = (itemId, qty) => {
    const next = cart.map((c) => c.itemId === itemId ? { ...c, quantity: qty } : c);
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
    try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) { }
  };

  // 按下「確認購買」→ 檢查登入後開啟彈窗
  const openCheckout = () => {
    setMessage('');

    if (!isLogin) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (!cart || cart.length === 0) {
      setMessage('購物車為空');
      return;
    }

    // 開啟收件资料視窗
    setShippingError('');
    setShowCheckoutModal(true);
  };

  // 在彈窗內確定送出訂單
  const confirmCheckout = async () => {
    const { name, phone, address } = shippingForm;

    // 前端驗證
    if (!name.trim()) { setShippingError('請填寫收件人姓名'); return; }

    const cleanPhone = phone.trim().replace(/[-\s]/g, '');
    if (!cleanPhone) {
      setShippingError('請填寫電話號碼');
      return;
    }
    if (!/^09\d{8}$/.test(cleanPhone)) {
      setShippingError('請輸入正確的台灣手機號碼 (10位數字，例如 0912345678)');
      return;
    }

    if (!address.trim()) { setShippingError('請填寫收件地址'); return; }

    setShippingError('');
    setSubmitting(true);

    try {
      for (const item of cart) {
        await apiFetch('/orders', {
          method: 'POST',
          body: JSON.stringify({
            itemId: item.itemId,
            quantity: item.quantity,
            note: item.note || '',
            // 收件人資訊寫入備註中（後端若有對應欄位亦可擴充）
            shippingName: name,
            shippingPhone: phone,
            shippingAddress: address,
          }),
        });
      }

      // 清空購物車
      localStorage.removeItem('cart');
      setCart([]);
      setShowCheckoutModal(false);
      try { window.dispatchEvent(new Event('cartUpdated')); } catch (e) { }
      try { window.dispatchEvent(new Event('ordersUpdated')); } catch (e) { }

      // 導向我的訂單頁
      navigate('/my-orders');
    } catch (err) {
      setShippingError(err.message || '結帳失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const total = cart.reduce((s, c) => s + (c.unitPrice || 0) * (c.quantity || 0), 0);

  return (
    <section>
      <h1>購物車</h1>

      {message && <div className="alert">{message}</div>}

      {cart.length === 0 ? (
        <p>購物車為空</p>
      ) : (
        <div>
          <ul className="cart-list">
            {cart.map((c) => (
              <li key={c.itemId} className="cart-item">
                <div>
                  <strong>{c.name}</strong>
                  <div>NT$ {c.unitPrice} x
                    <input
                      type="number"
                      min="1"
                      value={c.quantity}
                      onChange={(e) => updateQty(c.itemId, Number(e.target.value))}
                      style={{ width: 60, marginLeft: 8 }}
                    />
                  </div>
                  <div>備註: {c.note}</div>
                </div>

                <div>
                  <button onClick={() => removeItem(c.itemId)}>移除</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <p>總計: NT$ {total}</p>
            <button onClick={openCheckout}>確認購買</button>
          </div>
        </div>
      )}

      {/* 收件資料彈跳視窗 */}
      {showCheckoutModal && (
        <div className="checkout-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <h2>填寫收件資料</h2>
            <p className="checkout-subtitle">請確認您的收件人資訊，完成後點選確定購買</p>

            <div className="checkout-summary">
              <span>訂單總計</span>
              <span className="checkout-total">NT$ {total}</span>
            </div>

            {shippingError && (
              <div className="alert error" style={{ marginBottom: 16 }}>{shippingError}</div>
            )}

            <div className="form">
              <label>收件人姓名</label>
              <input
                placeholder="請輸入姓名"
                value={shippingForm.name}
                onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
              />

              <label>電話號碼</label>
              <input
                placeholder="例如 0912-345-678"
                value={shippingForm.phone}
                onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
              />

              <label>收件地址</label>
              <input
                placeholder="例如 台北市信義區信義路五段7號"
                value={shippingForm.address}
                onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
              />
            </div>

            <div className="checkout-actions">
              <button
                className="secondary"
                onClick={() => setShowCheckoutModal(false)}
                disabled={submitting}
              >
                取消
              </button>
              <button
                onClick={confirmCheckout}
                disabled={submitting}
              >
                {submitting ? '處理中...' : '確定購買'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CartPage;
