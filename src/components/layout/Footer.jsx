import React from 'react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-bottom">
        <span>&copy; {CURRENT_YEAR} EduCore Management System. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span className="footer-status-dot" />
          <span>System Operational</span>
        </div>
      </div>
    </footer>
  );
};
