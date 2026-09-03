import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar, Users, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const TeacherAssignmentsManager = () => {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Assignment Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    classId: '',
    subjectCode: 'CS-401',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    totalPoints: 100,
    instructions: ''
  });

  // View Submissions Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [reviewScore, setReviewScore] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [asnRes, clsRes] = await Promise.all([
        api.get('/teacher/assignments', token),
        api.get('/teacher/classes', token)
      ]);

      if (asnRes.success && asnRes.assignments) {
        setAssignments(asnRes.assignments);
      }
      if (clsRes.success && clsRes.classes) {
        setClasses(clsRes.classes);
        if (clsRes.classes.length > 0) {
          setCreateForm(prev => ({ ...prev, classId: clsRes.classes[0].id }));
        }
      }
    } catch {
      setError('Failed to load coursework and assignments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/teacher/assignments', createForm, token);
      if (res.success) {
        setSuccessMsg('Assignment published to class cohort successfully.');
        setIsCreateOpen(false);
        setCreateForm({
          title: '',
          classId: classes[0]?.id || 'CLS-12',
          subjectCode: 'CS-401',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          totalPoints: 100,
          instructions: ''
        });
        await fetchData();
      } else {
        setError(res.message || 'Failed to publish assignment.');
      }
    } catch {
      setError('An error occurred publishing the assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmission = async (submissionId) => {
    if (!reviewScore) {
      setError('Please provide a score before submitting evaluation.');
      return;
    }

    try {
      const res = await api.put(`/academic/submissions/${submissionId}/review`, {
        score: Number(reviewScore),
        feedback: reviewFeedback || 'Reviewed by instructor'
      }, token);

      if (res.success) {
        setSuccessMsg('Submission evaluated successfully.');
        setActiveSubmissionId(null);
        await fetchData();
        // Update local selectedAssignment
        setSelectedAssignment(prev => ({
          ...prev,
          submissions: prev.submissions.map(s => s.id === submissionId ? { ...s, score: Number(reviewScore), feedback: reviewFeedback, status: 'Reviewed' } : s)
        }));
      }
    } catch {
      setError('Failed to record submission grade.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <BookOpen size={24} color="#38bdf8" /> Coursework & Assignment Management
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Publish homework, term projects, and evaluate student submissions with automated grading.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> Create Assignment
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Assignment List */}
      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <LoadingSpinner text="Loading published assignments..." />
        </div>
      ) : assignments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          No assignments published yet. Click "Create Assignment" to post coursework for your classes.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {assignments.map((asn) => (
            <div key={asn.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase' }}>
                    {asn.subjectCode || 'Coursework'} • {asn.classId}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: '700', marginTop: '0.25rem' }}>
                    {asn.title}
                  </h3>
                </div>
                <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                  {asn.totalPoints} Pts
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                {asn.instructions}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={13} /> Due: {asn.dueDate}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981' }}>
                  {asn.submissionCount || 0} Submissions
                </span>
              </div>

              <button
                onClick={() => { setSelectedAssignment(asn); setIsSubmissionsOpen(true); }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', gap: '0.375rem' }}
              >
                <Eye size={15} /> Inspect Submissions ({asn.submissionCount || 0})
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Publish New Assignment"
      >
        <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Assignment Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Graph Algorithms & Shortest Path"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Class *</label>
              <select
                className="form-select"
                required
                value={createForm.classId}
                onChange={(e) => setCreateForm({ ...createForm, classId: e.target.value })}
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject Code *</label>
              <input
                type="text"
                required
                className="form-input"
                value={createForm.subjectCode}
                onChange={(e) => setCreateForm({ ...createForm, subjectCode: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Points</label>
              <input
                type="number"
                min="10"
                max="500"
                required
                className="form-input"
                value={createForm.totalPoints}
                onChange={(e) => setCreateForm({ ...createForm, totalPoints: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Instructions & Rubric</label>
            <textarea
              rows={4}
              className="form-input"
              placeholder="Provide clear submission criteria..."
              value={createForm.instructions}
              onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal
        isOpen={isSubmissionsOpen}
        onClose={() => { setIsSubmissionsOpen(false); setActiveSubmissionId(null); }}
        title={selectedAssignment ? `Submissions: ${selectedAssignment.title}` : 'Submissions'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '65vh', overflowY: 'auto' }}>
          {!selectedAssignment?.submissions || selectedAssignment.submissions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              No student submissions logged for this assignment yet.
            </div>
          ) : (
            selectedAssignment.submissions.map(sub => (
              <div key={sub.id} style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ color: '#ffffff' }}>{sub.studentName}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                      ({new Date(sub.submittedAt).toLocaleDateString()})
                    </span>
                  </div>
                  <span className={`badge ${sub.status === 'Reviewed' ? 'badge-success' : 'badge-warning'}`}>
                    {sub.status === 'Reviewed' ? `${sub.score}/${selectedAssignment.totalPoints}` : 'Pending Review'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {sub.content}
                </div>

                {sub.feedback && (
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem' }}>
                    Feedback: {sub.feedback}
                  </div>
                )}

                {/* Inline evaluation controls */}
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Score"
                    style={{ width: '80px', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                    className="form-input"
                    defaultValue={sub.score || ''}
                    onChange={(e) => setReviewScore(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Instructor feedback"
                    style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                    className="form-input"
                    defaultValue={sub.feedback || ''}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                  />
                  <button
                    onClick={() => handleReviewSubmission(sub.id)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    Save Grade
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
