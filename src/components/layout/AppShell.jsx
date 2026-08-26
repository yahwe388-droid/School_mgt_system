import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};
