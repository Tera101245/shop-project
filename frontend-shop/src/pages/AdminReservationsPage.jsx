import { useEffect, useState } from 'react';

import { apiFetch } from '../api/client';

export default function AdminReservationsPage() {
  // rows 儲存全部預約
  const [rows, setRows] = useState([]);

  // message 顯示操作結果
  const [message, setMessage] = useState('');

  // 載入全部預約
  const load = async () => {
    // 呼叫 GET /admin/reservations
    const result = await apiFetch('/admin/reservations');

    // 將資料放進 rows
    setRows(result.data);
  };

  // 頁面第一次載入時查詢資料
  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, []);

  // 更新預約狀態
  // action 可以是 approve 或 reject
  const updateStatus = async (id, action) => {
    setMessage('');

    try {
      // 呼叫 PATCH /admin/reservations/{id}/approve
      // 或 PATCH /admin/reservations/{id}/reject
      await apiFetch(`/admin/reservations/${id}/${action}`, {
        method: 'PATCH',
      });

      setMessage(action === 'approve' ? '已核准' : '已退回');

      // 操作成功後重新載入資料
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section>
      <h1>預約審核</h1>

      {message && <div className="alert">{message}</div>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>會員</th>
            <th>項目</th>
            <th>開始</th>
            <th>結束</th>
            <th>金額</th>
            <th>狀態</th>
            <th>備註</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.fullName}</td>
              <td>{r.itemName}</td>
              <td>{r.startTime?.replace('T', ' ')}</td>
              <td>{r.endTime?.replace('T', ' ')}</td>
              <td>{r.totalAmount}</td>
              <td>{r.status}</td>
              <td>{r.note}</td>

              <td>
                {/* 只有 PENDING 狀態才可以核准或退回 */}
                {r.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateStatus(r.id, 'approve')}
                    >
                      核准
                    </button>

                    <button
                      className="danger"
                      onClick={() => updateStatus(r.id, 'reject')}
                    >
                      退回
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}