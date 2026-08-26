import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Send, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export const AssignmentManager = () => {
  const { token, user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [selectedAsn, setSelectedAsn] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  const [asnForm, setAsnForm] = useState({
    title: '',
    subjectCode: 'CS-401',
    dueDate: '2026-09-10',
    totalPoints: 100,
    instructions: ''
  });

  const [submitForm, setSubmitForm] = useState({ content: '' });
  const [reviewForm, setReviewForm] = useState({ score: 90, feedback: '' });

  useEffect(() => {
    fetchAssignmentsData();
  }, []);

  const fetchAssignmentsData = async () => {
    const res = await api.get('/academic/assignments', token);
    if (res.success) {
      setAssignments(res.assignments);
      setSubmissions(res.submissions);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const res = await api.post('/academic/assignments', asnForm, token);
    if (res.success) {
      setIsAddModalOpen(false);
      setAsnForm({ title: '', subjectCode: 'CS-401', dueDate: '2026-09-10', totalPoints: 100, instructions: '' });
      fetchAssignmentsData();
    }
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!selectedAsn) return;
    const res = await api.post('/academic/submissions', {
      assignmentId: selectedAsn.id,
      studentId: user?.id,
      studentName: user?.name,
      content: submitForm.content
    }, token);

    if (res.success) {
      setIsSubmitModalOpen(false);
      fetchAssignmentsData();
    }
  };

  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    const res = await api.post(`/academic/submissions/${selectedSub.id}/review`, {
      score: parseInt(reviewForm.score),
      feedback: reviewForm.feedback
    }, token); // API uses PUT/POST review

    if (res.success) {
      setIsReviewModalOpen(false);
      fetchAssignmentsData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={24} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Homework & Course Assignments</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submission tracking and grading system</span>
          </div>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Teacher') && (
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Publish Assignment
          </button>
        )}
      </div>

      {/* Assignment Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {assignments.map((asn) => {
          const userSub = submissions.find((s) => s.assignmentId === asn.id && s.studentId === user?.id);

          return (
            <div key={asn.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-info">{asn.subjectCode}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {asn.dueDate}</span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem' }}>{asn.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{asn.instructions}</p>
              </div>

              {/* Student Action */}
              {user?.role === 'Student' && (
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  {userSub ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-success">Submitted ({userSub.status})</span>
                      {userSub.score !== undefined && (
                        <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.875rem' }}>
                          Score: {userSub.score} / {asn.totalPoints}
                        </strong>
                      )}
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => { setSelectedAsn(asn); setIsSubmitModalOpen(true); }}
                    >
                      <Send size={16} /> Submit Homework
                    </button>
                  )}
                </div>
              )}

              {/* Teacher/Admin Submissions List */}
              {(user?.role === 'Admin' || user?.role === 'Teacher') && (
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Submissions Received:</span>
                  {submissions.filter((s) => s.assignmentId === asn.id).map((s) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                      <span>{s.studentName}</span>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => { setSelectedSub(s); setIsReviewModalOpen(true); }}
                      >
                        {s.status === 'Reviewed' ? `Score: ${s.score}` : 'Grade'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Publish Assignment Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Publish New Assignment">
        <form onSubmit={handleCreateAssignment}>
          <div className="form-group">
            <label className="form-label">Assignment Title</label>
            <input type="text" required className="form-input" value={asnForm.title} onChange={(e) => setAsnForm({ ...asnForm, title: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <input type="text" required className="form-input" value={asnForm.subjectCode} onChange={(e) => setAsnForm({ ...asnForm, subjectCode: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" required className="form-input" value={asnForm.dueDate} onChange={(e) => setAsnForm({ ...asnForm, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Instructions</label>
            <textarea className="form-input" style={{ minHeight: '80px' }} value={asnForm.instructions} onChange={(e) => setAsnForm({ ...asnForm, instructions: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish</button>
          </div>
        </form>
      </Modal>

      {/* Submit Homework Modal */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title={`Submit Assignment: ${selectedAsn?.title}`}>
        <form onSubmit={handleSubmitHomework}>
          <div className="form-group">
            <label className="form-label">Submission Link / Content</label>
            <textarea required className="form-input" style={{ minHeight: '100px' }} placeholder="Paste GitHub link or written response..." value={submitForm.content} onChange={(e) => setSubmitForm({ content: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSubmitModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Now</button>
          </div>
        </form>
      </Modal>

      {/* Grade Submission Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Grade Submission: ${selectedSub?.studentName}`}>
        <form onSubmit={handleReviewSubmission}>
          <div className="form-group">
            <label className="form-label">Score (Points)</label>
            <input type="number" min="0" max="100" required className="form-input" value={reviewForm.score} onChange={(e) => setReviewForm({ ...reviewForm, score: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Teacher Feedback</label>
            <textarea className="form-input" style={{ minHeight: '80px' }} value={reviewForm.feedback} onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsReviewModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Score</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
