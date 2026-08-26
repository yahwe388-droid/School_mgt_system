import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, BookOpen, Award, CalendarCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const NotificationCenter = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await api.get('/communication/notifications', token);
    if (res.success) {
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    }
  };

  const handleMarkRead = async (id) => {
    await api.post(`/communication/notifications/${id}/read`, {}, token);
    fetchNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment': return <BookOpen size={18} color="var(--primary)" />;
      case 'exam':
      case 'result': return <Award size={18} color="var(--accent-amber)" />;
      case 'attendance': return <CalendarCheck size={18} color="var(--accent-emerald)" />;
      default: return <Bell size={18} color="var(--accent-cyan)" />;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={24} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>In-App Notification Center</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event-driven notifications & alerts</span>
          </div>
        </div>

        {unreadCount > 0 && (
          <span className="badge badge-danger">{unreadCount} Unread Notifications</span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No notifications at this time.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: n.isRead ? 'var(--bg-card)' : 'rgba(99, 102, 241, 0.06)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <div style={{ marginTop: '0.25rem' }}>{getNotificationIcon(n.type)}</div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>{n.title}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{n.message}</p>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-light)', marginTop: '0.375rem', display: 'block' }}>
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  className="btn btn-secondary btn-icon"
                  title="Mark as Read"
                  onClick={() => handleMarkRead(n.id)}
                >
                  <CheckCheck size={16} color="var(--primary)" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
