import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        zIndex: 9999
      }}>
        <Loader2 size={40} className="animate-spin" color="var(--primary)" />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>{text}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
      <Loader2 size={18} className="animate-spin" color="var(--primary)" />
      {text && <span style={{ fontSize: '0.875rem' }}>{text}</span>}
    </div>
  );
};
