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
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          overflow: 'hidden',
          padding: '3px',
          border: '2px solid rgba(99,102,241,0.25)',
          boxShadow: '0 6px 16px rgba(99,102,241,0.25)',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img src="/logo.png" alt="EduCore Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
        <Loader2 size={36} className="animate-spin" color="var(--primary)" />
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
