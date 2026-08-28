import { useEffect, useState } from 'react';

import { apiFetch } from '../api/client';

export default function MyReservationsPage() {
  // rows 儲存我的預約列表
  const [rows, setRows] = useState([]);

  // message 儲存成功或錯誤訊息
  const [message, setMessage] = useState('');

  // 載入我的預約資料
  const load = async () => {
    // 呼叫 GET /reservations/my
    const result = await apiFetch('/reservations/my');

    // 將後端回傳資料放進 rows
    setRows(result.data);
  };

  // 頁面第一次載入時查詢資料
  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, []);

  // 取消預約
  const cancel = async (id) => {
    setMessage('');

    try {
      // 呼叫 PATCH /reservations/{id}/cancel
      await apiFetch(`/reservations/${id}/cancel`, {
        method: 'PATCH',
      });

      setMessage('取消成功');

      // 取消成功後重新載入資料
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section>
      <h1>我的預約</h1>

      {message && <div className="alert">{message}</div>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>項目</th>
            <th>開始</th>
            <th>結束</th>
            <th>金額</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.itemName}</td>

              {/* 把 2026-06-23T10:00 轉成 2026-06-23 10:00 */}
              <td>{r.startTime?.replace('T', ' ')}</td>
              <td>{r.endTime?.replace('T', ' ')}</td>

              <td>{r.totalAmount}</td>
              <td>{r.status}</td>

              <td>
                {/* 只有 PENDING 或 APPROVED 可以取消 */}
                {(r.status === 'PENDING' || r.status === 'APPROVED') && (
                  <button
                    className="secondary"
                    onClick={() => cancel(r.id)}
                  >
                    取消
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}