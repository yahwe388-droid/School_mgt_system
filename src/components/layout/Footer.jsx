import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  HeartHandshake,
  Mail,
  Phone,
  MapPin,
  Github,
  ExternalLink,
  X,
  Info
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const AboutModal = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div
      className="modal-container"
      style={{ maxWidth: '520px' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            overflow: 'hidden', border: '2px solid rgba(99,102,241,0.3)'
          }}>
            <img src="/logo.png" alt="EduCore" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>About EduCore</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>School Management System</span>
          </div>
        </div>
        <button onClick={onClose} className="btn btn-secondary btn-icon">
          <X size={18} />
        </button>
      </div>

      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
          <strong style={{ color: 'var(--text-main)' }}>EduCore</strong> is a modern, full-stack School Management
          Portal designed to streamline academic administration. It provides role-based access for Admins, Teachers,
          Students, and Parents — all from a single unified platform.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          {[
            { icon: ShieldCheck,    label: 'Role-Based Access', color: 'var(--primary)',         desc: 'Admin · Teacher · Student · Parent' },
            { icon: GraduationCap,  label: 'Academic Tools',    color: 'var(--accent-emerald)',  desc: 'Grades · Attendance · Timetable'    },
            { icon: HeartHandshake, label: 'Parent Portal',     color: 'var(--accent-amber)',    desc: 'Real-time progress monitoring'       },
            { icon: ShieldCheck,    label: 'Secure & Fast',     color: 'var(--accent-cyan)',     desc: 'JWT Auth · 256-bit encrypted'        },
          ].map(({ icon: Icon, label, color, desc }) => (
            <div key={label} style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--border-light)'
            }}>
              <Icon size={18} color={color} style={{ marginBottom: '0.375rem' }} />
              <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(99,102,241,0.07)',
          border: '1px solid rgba(99,102,241,0.2)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={14} color="var(--primary)" /><span>admin@educore.school</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={14} color="var(--accent-emerald)" /><span>+1 (800) EDU-CORE · Ext. 101</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={14} color="var(--accent-rose)" /><span>Administration Office, Room 100</span>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center' }}>
          &copy; {CURRENT_YEAR} EduCore Management System. All rights reserved.
        </p>
      </div>
    </div>
  </div>
);

export const Footer = () => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <footer className="app-footer">
        <div className="footer-inner">

          {/* Brand */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                overflow: 'hidden', border: '1px solid rgba(99,102,241,0.35)', flexShrink: 0
              }}>
                <img src="/logo.png" alt="EduCore" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>EduCore</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem', lineHeight: '1.6' }}>
              Modern School Management Portal.<br />
              Empowering educators &amp; learners.
            </p>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <span className="footer-section-label">Quick Links</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              {['Dashboard', 'Academic Calendar', 'Results & Grades', 'Announcements'].map((label) => (
                <a key={label} href="#" className="footer-link">{label}</a>
              ))}
            </div>
          </div>

          {/* System */}
          <div className="footer-col">
            <span className="footer-section-label">System</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              <button onClick={() => setShowAbout(true)} className="footer-link footer-link-btn">
                <Info size={13} /> About EduCore
              </button>
              <a href="mailto:admin@educore.school" className="footer-link">
                <Mail size={13} /> Contact Admin
              </a>
              <a href="#" className="footer-link">
                <ShieldCheck size={13} /> Privacy Policy
              </a>
              <a href="#" className="footer-link" target="_blank" rel="noreferrer">
                <Github size={13} /> Source Code <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <span className="footer-section-label">Contact</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {[
                { icon: Mail,    color: 'var(--primary)',        text: 'admin@educore.school' },
                { icon: Phone,   color: 'var(--accent-emerald)', text: '+1 (800) EDU-CORE'    },
                { icon: MapPin,  color: 'var(--accent-rose)',    text: 'Admin Office · Rm 100' },
              ].map(({ icon: Icon, color, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <Icon size={13} color={color} style={{ flexShrink: 0 }} />{text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>&copy; {CURRENT_YEAR} EduCore Management System. All rights reserved.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span className="footer-status-dot" />
            <span>System Operational</span>
          </div>
        </div>
      </footer>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
};
