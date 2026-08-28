import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

// 姓名遮罩：只顯示姓氏，其餘用 **
function maskName(name) {
  if (!name || name.trim() === '') return '-';
  const trimmed = name.trim();
  if (trimmed.length === 1) return trimmed;
  return trimmed[0] + '**';
}

// 電話遮罩：中間 4 碼用 ****
function maskPhone(phone) {
  if (!phone || phone.trim() === '') return '-';
  const p = phone.replace(/[-\s]/g, '');
  if (p.length < 7) return phone;
  return p.slice(0, 3) + '****' + p.slice(-3);
}

export default function MyOrdersPage() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const result = await apiFetch('/orders/my');
    setRows(result.data);
  };

  useEffect(() => {
    load().catch((err) => setMessage(err.message));

    const onOrdersUpdated = () => { load().catch(() => { }); };
    window.addEventListener('ordersUpdated', onOrdersUpdated);
    return () => window.removeEventListener('ordersUpdated', onOrdersUpdated);
  }, []);

  const cancel = async (id) => {
    setMessage('');
    try {
      await apiFetch(`/orders/${id}/cancel`, { method: 'PATCH' });
      setMessage('取消成功');
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section>
      <h1>我的訂單</h1>

      {message && <div className="alert">{message}</div>}

      {rows.length === 0 ? (
        <p>目前沒有訂單</p>
      ) : (
        <div className="order-list">
          {rows.map((r) => (
            <div key={r.id} className="order-card">
              {/* 上方：訂單基本資訊 */}
              <div className="order-card-header">
                <span className="order-id">訂單 #{r.id}</span>
                <span className={`order-badge status-${r.status?.toLowerCase()}`}>
                  {r.status}
                </span>
              </div>

              <div className="order-card-body">
                {/* 左側：商品與金額 */}
                <div className="order-info-block">
                  <div className="order-info-row">
                    <span className="order-label">商品</span>
                    <span>{r.name || r.itemName}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-label">數量</span>
                    <span>{r.quantity}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-label">單價</span>
                    <span>NT$ {r.unitPrice ?? r.price}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-label">總金額</span>
                    <span className="order-total">NT$ {r.totalPrice ?? r.totalAmount}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-label">訂單日期</span>
                    <span>{(r.orderDate || '')?.replace?.('T', ' ')?.slice(0, 16)}</span>
                  </div>
                </div>

                {/* 右側：收件資訊 */}
                <div className="order-shipping-block">
                  <div className="order-shipping-title">📦 收件資訊</div>
                  <div className="order-info-row">
                    <span className="order-label">收件人</span>
                    <span>{maskName(r.shippingName)}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-label">電話</span>
                    <span>{maskPhone(r.shippingPhone)}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-label">地址</span>
                    <span>{r.shippingAddress || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 底部：操作按鈕 */}
              {(r.status === 'PENDING' || r.status === 'APPROVED') && (
                <div className="order-card-footer">
                  <button className="secondary" onClick={() => cancel(r.id)}>
                    取消訂單
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
