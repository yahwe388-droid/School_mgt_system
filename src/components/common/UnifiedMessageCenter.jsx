import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Mail, MailOpen, Search, User, Clock, Check, AlertCircle, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const UnifiedMessageCenter = ({ roleTitle = "Portal", apiBase = "/teacher" }) => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeFolder, setActiveFolder] = useState('inbox'); // 'inbox' | 'sent'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected message for reading
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // Compose modal
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    recipientId: '',
    recipientName: '',
    subject: '',
    content: ''
  });
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchContacts();
  }, [apiBase]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`${apiBase}/messages`, token);
      if (res.success && res.messages) {
        setMessages(res.messages);
      } else {
        setError(res.message || 'Failed to load messages.');
      }
    } catch (err) {
      setError('An error occurred loading communication records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      if (apiBase === '/teacher') {
        const [stuRes, prnRes] = await Promise.all([
          api.get('/records/students', token),
          api.get('/records/parents', token)
        ]);
        const list = [];
        if (stuRes.success && stuRes.students) {
          stuRes.students.forEach(s => list.push({ id: s.userId || s.id, name: `${s.name} (Student - ${s.studentId})`, role: 'STUDENT' }));
        }
        if (prnRes.success && prnRes.parents) {
          prnRes.parents.forEach(p => list.push({ id: p.userId || p.id, name: `${p.name} (Parent)`, role: 'PARENT' }));
        }
        list.push({ id: 'USR-001', name: 'System Administrator (Admin)', role: 'ADMIN' });
        setContacts(list);
      } else {
        const tchRes = await api.get('/records/teachers', token);
        const list = [];
        if (tchRes.success && tchRes.teachers) {
          tchRes.teachers.forEach(t => list.push({ id: t.userId || t.id, name: `${t.name} (Faculty - ${t.department})`, role: 'TEACHER' }));
        }
        list.push({ id: 'USR-001', name: 'Principal & Administration', role: 'ADMIN' });
        setContacts(list);
      }
    } catch {
      setContacts([
        { id: 'USR-001', name: 'Administration Office', role: 'ADMIN' },
        { id: 'USR-002', name: 'Dr. Robert Vance (Faculty)', role: 'TEACHER' }
      ]);
    }
  };

  const handleOpenMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead && msg.recipientId === user?.id) {
      try {
        await api.put(`${apiBase}/messages/${msg.id}/read`, {}, token);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post(`${apiBase}/messages`, composeForm, token);
      if (res.success) {
        setSuccessMsg('Message transmitted successfully.');
        setIsComposeOpen(false);
        setComposeForm({ recipientId: '', recipientName: '', subject: '', content: '' });
        await fetchMessages();
      } else {
        setError(res.message || 'Failed to dispatch message.');
      }
    } catch (err) {
      setError('An error occurred transmitting the message.');
    } finally {
      setSending(false);
    }
  };

  // Filter messages into Inbox vs Sent
  const inboxMessages = messages.filter(m => m.recipientId === user?.id);
  const sentMessages = messages.filter(m => m.senderId === user?.id);
  const activeList = activeFolder === 'inbox' ? inboxMessages : sentMessages;

  const filteredList = activeList.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.content && m.content.toLowerCase().includes(q)) ||
      (m.senderName && m.senderName.toLowerCase().includes(q)) ||
      (m.recipientName && m.recipientName.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <MessageSquare size={24} color="#6366f1" /> Official Communication Channel
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Direct institutional correspondence between faculty, students, parents, and administrative leadership.
          </p>
        </div>

        <button
          onClick={() => {
            setComposeForm({ recipientId: contacts[0]?.id || '', recipientName: contacts[0]?.name || '', subject: '', content: '' });
            setIsComposeOpen(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> Compose Message
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Main Mail Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
        {/* Sidebar Folders */}
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', height: 'fit-content' }}>
          <button
            onClick={() => { setActiveFolder('inbox'); setSelectedMessage(null); }}
            className={`btn ${activeFolder === 'inbox' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'space-between', padding: '0.75rem 1rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Mail size={16} /> Inbox
            </span>
            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              {inboxMessages.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveFolder('sent'); setSelectedMessage(null); }}
            className={`btn ${activeFolder === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'space-between', padding: '0.75rem 1rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Send size={16} /> Sent Items
            </span>
            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              {sentMessages.length}
            </span>
          </button>
        </div>

        {/* Message Feed / Reader */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search Bar */}
          <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              className="form-input"
              style={{ border: 'none', background: 'transparent', padding: 0 }}
              placeholder="Filter messages by subject, author, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <LoadingSpinner text="Retrieving secure messages..." />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <MailOpen size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <div style={{ fontWeight: '600', color: '#ffffff' }}>No messages in {activeFolder}</div>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Your communication log is currently empty.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredList.map((msg) => {
                const isUnread = !msg.isRead && msg.recipientId === user?.id;
                const isSelected = selectedMessage?.id === msg.id;

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleOpenMessage(msg)}
                    className="glass-card"
                    style={{
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      borderLeft: isUnread ? '4px solid #6366f1' : isSelected ? '4px solid #38bdf8' : '4px solid transparent',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : isUnread ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: isUnread ? '700' : '600', color: isUnread ? '#ffffff' : '#cbd5e1', fontSize: '0.9375rem' }}>
                        {activeFolder === 'inbox' ? msg.senderName : `To: ${msg.recipientName}`}
                        <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.5rem', textTransform: 'uppercase' }}>
                          ({activeFolder === 'inbox' ? msg.senderRole : msg.recipientRole})
                        </span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {msg.subject}
                    </div>

                    <p style={{
                      fontSize: '0.8125rem',
                      color: '#94a3b8',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: isSelected ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4'
                    }}>
                      {msg.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Compose Official Message"
      >
        <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Recipient *</label>
            <select
              className="form-select"
              required
              value={composeForm.recipientId}
              onChange={(e) => {
                const target = contacts.find(c => c.id === e.target.value);
                setComposeForm({
                  ...composeForm,
                  recipientId: e.target.value,
                  recipientName: target?.name || ''
                });
              }}
            >
              <option value="">Select recipient...</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Inquiry regarding Course Syllabus"
              value={composeForm.subject}
              onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message Content *</label>
            <textarea
              required
              rows={5}
              className="form-input"
              style={{ resize: 'vertical' }}
              placeholder="Type your message here..."
              value={composeForm.content}
              onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsComposeOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Send size={14} /> {sending ? 'Transmitting...' : 'Send Message'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
