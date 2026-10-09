import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

const POLL_INTERVAL_MS = 30000;

const TYPE_ICON = {
  success: <CheckCircle2 size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

/**
 * Chuông thông báo: polling 30 giây, lưu danh sách đã đọc trong localStorage theo từng user.
 */
export default function NotificationBell({ userId, role }) {
  const storageKey = `pawderm_read_notifs_${userId}_${role}`;
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));
    } catch {
      return new Set();
    }
  });
  const wrapperRef = useRef(null);

  const load = useCallback(async () => {
    const list = await notificationService.getNotifications(userId, role);
    setItems(list);
  }, [userId, role]);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const persistRead = (set) => {
    setReadIds(new Set(set));
    // Giữ tối đa 200 id gần nhất
    localStorage.setItem(storageKey, JSON.stringify([...set].slice(-200)));
  };

  const markRead = (id) => {
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    persistRead(next);
  };

  const markAllRead = () => {
    const next = new Set(readIds);
    items.forEach((n) => next.add(n.id));
    persistRead(next);
  };

  const unreadCount = items.filter((n) => !readIds.has(n.id)).length;

  return (
    <div className="notif-wrapper" ref={wrapperRef}>
      <button
        type="button"
        id="btn-notification-bell"
        className={`btn-notification-bell ${unreadCount ? 'has-unread' : ''}`}
        title="Thông báo"
        aria-label={`Thông báo (${unreadCount} chưa đọc)`}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="notification-count-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel animate-fadeIn" role="dialog" aria-label="Danh sách thông báo">
          <div className="notif-panel-header">
            <strong>Thông báo</strong>
            {unreadCount > 0 && (
              <button type="button" className="notif-mark-all" onClick={markAllRead}>
                <CheckCheck size={14} /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="notif-list">
            {items.length === 0 ? (
              <div className="notif-empty">
                <Bell size={28} />
                <span>Chưa có thông báo nào</span>
              </div>
            ) : (
              items.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  className={`notif-item ${readIds.has(n.id) ? '' : 'unread'}`}
                  onClick={() => markRead(n.id)}
                >
                  <span className={`notif-icon ${n.type}`}>{TYPE_ICON[n.type] || TYPE_ICON.info}</span>
                  <span className="notif-body">
                    <span className="notif-title">{n.title}</span>
                    <span className="notif-message">{n.message}</span>
                    <span className="notif-time">{timeAgo(n.created_at)}</span>
                  </span>
                  {!readIds.has(n.id) && <span className="notif-unread-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
