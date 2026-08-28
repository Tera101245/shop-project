import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export default function AdminOrdersPage() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const result = await apiFetch('/admin/orders');
    setRows(result.data);
  };

  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, []);

  const updateStatus = async (id, action) => {
    setMessage('');
    try {
      await apiFetch(`/admin/orders/${id}/${action}`, { method: 'PATCH' });
      let msg = '';
      if (action === 'approve') msg = '已確認';
      else if (action === 'ship') msg = '已出貨';
      else if (action === 'reject') msg = '已退訂';
      setMessage(msg);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section>
      <h1>訂單審核</h1>

      {message && <div className="alert">{message}</div>}

      {rows.length === 0 ? (
        <p>目前沒有訂單</p>
      ) : (
        <div className="order-list">
          {rows.map((r) => (
            <div key={r.id} className="order-card">
              {/* 標題列：訂單 ID + 狀態徽章 */}
              <div className="order-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="order-id">訂單 #{r.id}</span>
                  <span className="order-customer">帳號：{r.username}</span>
                </div>
                <span className={`order-badge status-${r.status?.toLowerCase()}`}>
                  {r.status}
                </span>
              </div>

              <div className="order-card-body">
                {/* 左欄：訂單資訊 */}
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
                    <span className="order-label">日期</span>
                    <span>{(r.orderDate || '')?.replace?.('T', ' ')?.slice(0, 16)}</span>
                  </div>
                  {r.note && (
                    <div className="order-info-row">
                      <span className="order-label">備註</span>
                      <span>{r.note}</span>
                    </div>
                  )}
                </div>

                {/* 右欄：完整收件資訊（管理員可看完整內容） */}
                <div className="order-shipping-block">
                  <div className="order-shipping-title">📦 收件資訊</div>
                  <div className="order-info-row">
                    <span className="order-label">收件人</span>
                    <span>{r.shippingName || '-'}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-label">電話</span>
                    <span>{r.shippingPhone || '-'}</span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-label">地址</span>
                    <span style={{ textAlign: 'right', maxWidth: 180, lineHeight: 1.5 }}>
                      {r.shippingAddress || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 底部：操作按鈕 */}
              <div className="order-card-footer">
                {r.status === 'PENDING' && (
                  <>
                    <button onClick={() => updateStatus(r.id, 'approve')}>
                      ✓ 確認
                    </button>
                    <button
                      className="danger"
                      style={{ marginLeft: 8 }}
                      onClick={() => updateStatus(r.id, 'reject')}
                    >
                      ✕ 退訂
                    </button>
                  </>
                )}
                {r.status === 'APPROVED' && (
                  <button onClick={() => updateStatus(r.id, 'ship')}>
                    🚚 出貨
                  </button>
                )}
                {(r.status === 'SHIPPED' || r.status === 'CANCELLED' || r.status === 'REJECTED') && (
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>無可用操作</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
