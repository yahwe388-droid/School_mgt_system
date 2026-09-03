import React, { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Clock, Award, Search, Info, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StudentCoursesManager = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/student/courses', token);
      if (res.success && res.courses) {
        setCourses(res.courses);
      } else {
        setError(res.message || 'Failed to load enrolled courses.');
      }
    } catch (err) {
      setError('An error occurred retrieving enrolled curriculum courses.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <LoadingSpinner text="Loading enrolled courses..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <BookOpen size={24} color="#10b981" /> Enrolled Academic Courses
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Current semester subjects, faculty instructors, and timetable schedules.
          </p>
        </div>

        <div style={{ width: '280px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search subjects or instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
          <BookOpen size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.125rem', color: '#ffffff', marginBottom: '0.5rem' }}>No Courses Found</h3>
          <p style={{ fontSize: '0.875rem' }}>You are not registered in any matching course curriculum for this semester.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredCourses.map((course) => (
            <div key={course.id || course.code} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {course.code || 'CRS-01'}
                  </span>
                  <h3 style={{ fontSize: '1.125rem', color: '#ffffff', fontWeight: '600', marginTop: '0.2rem' }}>
                    {course.name}
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: '600' }}>
                  {course.credits ? `${course.credits} Credits` : '3 Credits'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                  <User size={15} color="#38bdf8" />
                  <span>Instructor: <strong style={{ color: '#e2e8f0' }}>{course.teacherName || 'Faculty Instructor'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                  <Clock size={15} color="#fbbf24" />
                  <span>Schedule: <strong style={{ color: '#e2e8f0' }}>{course.schedule || 'Weekly Lectures'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                  <CheckCircle2 size={15} color="#10b981" />
                  <span>Status: <strong style={{ color: '#34d399' }}>Active Enrollment</strong></span>
                </div>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedCourse(course)}
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Info size={14} /> Course Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={`Course Details: ${selectedCourse.name}`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>{selectedCourse.name}</div>
                <div style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: '600' }}>{selectedCourse.code} • {selectedCourse.department || 'Academic Department'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Faculty Instructor</span>
                <strong style={{ color: '#ffffff' }}>{selectedCourse.teacherName || 'Faculty Instructor'}</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Academic Credits</span>
                <strong style={{ color: '#ffffff' }}>{selectedCourse.credits || 3} Credit Units</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Class Lecture Schedule</span>
                <strong style={{ color: '#ffffff' }}>{selectedCourse.schedule || 'Scheduled via Central Registrar'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedCourse(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
