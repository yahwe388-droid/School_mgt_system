import React, { useState, useEffect } from 'react';
import { Bell, Plus, Pin, Filter, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export const AnnouncementManager = () => {
  const { token, user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  const [form, setForm] = useState({
    title: '',
    content: '',
    targetRole: 'All',
    isPinned: false
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const res = await api.get('/communication/announcements', token);
    if (res.success) setAnnouncements(res.announcements);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const res = await api.post('/communication/announcements', form, token);
    if (res.success) {
      setIsModalOpen(false);
      setForm({ title: '', content: '', targetRole: 'All', isPinned: false });
      fetchAnnouncements();
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a) => selectedRoleFilter === 'All' || a.targetRole === selectedRoleFilter
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Role Filter */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={24} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>School Noticeboard & Announcements</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role-aware broadcast center</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {['All', 'Admin', 'Teacher', 'Student', 'Parent'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRoleFilter(r)}
                className={`btn ${selectedRoleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '20px' }}
              >
                {r}
              </button>
            ))}
          </div>

          {(user?.role === 'Admin' || user?.role === 'Teacher') && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Publish Notice
            </button>
          )}
        </div>
      </div>

      {/* Notices List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredAnnouncements.map((anc) => (
          <div
            key={anc.id}
            className="glass-card"
            style={{
              padding: '1.5rem',
              borderLeft: anc.isPinned ? '4px solid var(--accent-amber)' : '1px solid var(--border-color)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {anc.isPinned && <Pin size={16} color="var(--accent-amber)" />}
                <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)' }}>{anc.title}</h3>
              </div>
              <span className="badge badge-info">Target: {anc.targetRole}</span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{anc.content}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-light)' }}>
              <span>Published by: <strong>{anc.author}</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={14} /> {new Date(anc.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Notice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish School Announcement">
        <form onSubmit={handlePublish}>
          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input type="text" required className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Audience Role</label>
              <select className="form-select" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                <option value="All">All Roles (School-wide)</option>
                <option value="Teacher">Faculty & Staff</option>
                <option value="Student">Students Only</option>
                <option value="Parent">Parents & Guardians</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <input type="checkbox" id="pinned" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
              <label htmlFor="pinned" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Pin Notice to Top</label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Content Message</label>
            <textarea required className="form-input" style={{ minHeight: '100px' }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Notice</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
