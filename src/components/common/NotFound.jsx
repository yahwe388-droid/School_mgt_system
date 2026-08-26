import React from 'react';
import { HelpCircle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '480px', textAlign: 'center' }}>
        <HelpCircle size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>404 - Page Not Found</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The module or page you requested could not be located or you may lack authorized access.
        </p>
        <a href="/" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <Home size={18} /> Return to Dashboard
        </a>
      </div>
    </div>
  );
};
