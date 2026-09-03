import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Award, CheckCircle, UploadCloud, AlertCircle, FileText, Send } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StudentAssignmentsManager = () => {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Submit Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/student/assignments', token);
      if (res.success && res.assignments) {
        setAssignments(res.assignments);
      } else {
        setError(res.message || 'Failed to load assignments.');
      }
    } catch (err) {
      setError('An error occurred retrieving student coursework assignments.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionContent(assignment.submission?.content || '');
    setIsSubmitModalOpen(true);
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!submissionContent.trim()) {
      setError('Please provide your solution, text, or file URL before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/student/assignments/${selectedAssignment.id}/submit`, {
        content: submissionContent
      }, token);

      if (res.success) {
        setSuccess(`Homework for "${selectedAssignment.title}" submitted successfully!`);
        setIsSubmitModalOpen(false);
        fetchAssignments();
      } else {
        setError(res.message || 'Failed to submit assignment.');
      }
    } catch (err) {
      setError('An error occurred submitting homework.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving coursework assignments..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <BookOpen size={24} color="#10b981" /> Coursework & Assignment Submissions
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Submit your homework solutions, monitor grading feedback, and track submission deadlines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Total Assignments: <strong style={{ color: '#ffffff' }}>{assignments.length}</strong>
          </span>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {assignments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
          <BookOpen size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.125rem', color: '#ffffff', marginBottom: '0.5rem' }}>No Active Assignments</h3>
          <p style={{ fontSize: '0.875rem' }}>Your faculty instructors have not posted any pending coursework for your class.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {assignments.map((asn) => {
            const isSubmitted = asn.isSubmitted;
            const sub = asn.submission;
            const isGraded = sub?.grade !== undefined && sub?.grade !== null;

            return (
              <div
                key={asn.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderLeft: `4px solid ${isGraded ? '#34d399' : isSubmitted ? '#38bdf8' : '#f59e0b'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                      {asn.subjectCode || 'GEN-101'}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', color: '#ffffff', fontWeight: '600', marginTop: '0.2rem' }}>
                      {asn.title}
                    </h3>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                    backgroundColor: isGraded ? 'rgba(52, 211, 153, 0.15)' : isSubmitted ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isGraded ? '#34d399' : isSubmitted ? '#38bdf8' : '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    {isGraded ? <CheckCircle size={12} /> : isSubmitted ? <Clock size={12} /> : <AlertCircle size={12} />}
                    {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'Pending Submission'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.5', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                  {asn.instructions || 'No specific instructions provided.'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} /> Due: <strong style={{ color: '#e2e8f0' }}>{asn.dueDate || 'Open'}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={14} /> Max: <strong style={{ color: '#e2e8f0' }}>{asn.totalPoints || 100} pts</strong>
                  </span>
                </div>

                {/* Submission / Grade Details Banner */}
                {isSubmitted && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: isGraded ? 'rgba(16, 185, 129, 0.08)' : 'rgba(56, 189, 248, 0.08)',
                    borderRadius: '8px',
                    border: `1px solid ${isGraded ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)'}`,
                    fontSize: '0.8125rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#94a3b8' }}>Submitted Solution:</span>
                      <span style={{ color: '#38bdf8', fontWeight: '600' }}>
                        {sub?.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recorded'}
                      </span>
                    </div>
                    <div style={{ color: '#e2e8f0', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {sub?.content}
                    </div>
                    {isGraded && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ color: '#34d399', fontWeight: '700' }}>Score: {sub.grade} / {asn.totalPoints || 100}</span>
                        {sub.feedback && <p style={{ color: '#cbd5e1', marginTop: '0.2rem', fontStyle: 'italic' }}>Feedback: "{sub.feedback}"</p>}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ paddingTop: '0.5rem', marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className={`btn ${isSubmitted ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleOpenSubmit(asn)}
                    style={{ fontSize: '0.8125rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <UploadCloud size={15} />
                    {isSubmitted ? 'Update Submission' : 'Submit Homework'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {isSubmitModalOpen && selectedAssignment && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title={`Submit: ${selectedAssignment.title}`}
          maxWidth="600px"
        >
          <form onSubmit={handleSubmitHomework} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.8125rem' }}>
              <div style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>Assignment Instructions:</div>
              <div style={{ color: '#ffffff' }}>{selectedAssignment.instructions || 'Submit requested assignment materials.'}</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '500' }}>
                Your Solution, Written Answer, or Project Repository Link *
              </label>
              <textarea
                className="input-field"
                rows={6}
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Paste your solution text, project link (e.g. GitHub/Google Docs), or written essay here..."
                style={{ width: '100%', resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Send size={15} /> {submitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
