import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.3)', color: '#f43f5e', icon: AlertCircle },
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', color: '#10b981', icon: CheckCircle2 },
    info: { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)', color: '#6366f1', icon: Info }
  };

  const current = styles[type] || styles.info;
  const Icon = current.icon;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      backgroundColor: current.bg,
      border: `1px solid ${current.border}`,
      color: current.color,
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
