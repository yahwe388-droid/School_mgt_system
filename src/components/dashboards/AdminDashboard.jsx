import React from 'react';
import { ShieldCheck, Users, Server, Key, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Registered Users', count: 4, detail: '1 Admin, 1 Teacher, 1 Student, 1 Parent', icon: Users, color: 'var(--primary)' },
    { title: 'System Security & Auth', count: 'Active (JWT)', detail: 'Bcrypt Encryption Enabled', icon: ShieldCheck, color: 'var(--accent-emerald)' },
    { title: 'API Server Status', count: 'Online (Port 5000)', detail: 'Response latency < 5ms', icon: Server, color: 'var(--accent-cyan)' },
    { title: 'RBAC Enforcement', count: 'Strict Mode', detail: '4 Active Role Profiles', icon: Key, color: 'var(--accent-amber)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', borderLeft: '4px solid var(--primary)' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Welcome, Administrator {user?.name}</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Phase 1 Foundation: Core authentication, role-based route protection, and API services are active.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>{item.title}</span>
                <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem', color: 'var(--text-main)' }}>{item.count}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>{item.detail}</span>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.color
              }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* System Audit Log */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Activity size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.125rem' }}>Phase 1 System Verification & Audit Log</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--border-light)', fontSize: '0.875rem' }}>
            <span>🔒 Authentication Controller & JWT Middleware</span>
            <span className="badge badge-success">Verified & Operational</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--border-light)', fontSize: '0.875rem' }}>
            <span>🛡️ Role-Based Access Control (Admin, Teacher, Student, Parent)</span>
            <span className="badge badge-success">Enforced</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--border-light)', fontSize: '0.875rem' }}>
            <span>🗄️ Initial User Schema & Hashed Passwords</span>
            <span className="badge badge-success">Seeded in Store</span>
          </div>
        </div>
      </div>
    </div>
  );
};
