import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Layers, Users, Building, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';

export const AcademicStructureManager = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'classes' | 'subjects'
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  // Forms
  const [classForm, setClassForm] = useState({ title: '', code: '', level: 9, status: 'Active' });
  const [sectionForm, setSectionForm] = useState({ classId: '', title: '', room: '', capacity: 30, status: 'Active' });
  const [subjectForm, setSubjectForm] = useState({ title: '', code: '', department: 'Science', credits: 3 });

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    setLoading(true);
    try {
      const clsRes = await api.get('/school/classes');
      if (clsRes.success) {
        setClasses(clsRes.classes || []);
        if (clsRes.sections) setSections(clsRes.sections);
      }

      const secRes = await api.get('/school/sections');
      if (secRes.success && secRes.sections) {
        setSections(secRes.sections);
      }

      const subRes = await api.get('/school/subjects');
      if (subRes.success) {
        setSubjects(subRes.subjects || []);
      }
    } catch (err) {
      console.error('Failed to fetch academic structure:', err);
    } finally {
      setLoading(false);
    }
  };

  // Class Management
  const handleAddClass = async (e) => {
    e.preventDefault();
    setError('');
    const res = await api.post('/school/classes', classForm, token);
    if (res.success) {
      setIsClassModalOpen(false);
      setClassForm({ title: '', code: '', level: 9, status: 'Active' });
      setSuccess('Class created successfully.');
      fetchAcademicData();
    } else {
      setError(res.message || 'Failed to create class.');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class level?')) return;
    const res = await api.delete(`/school/classes/${id}`, token);
    if (res.success) {
      setSuccess('Class deleted successfully.');
      fetchAcademicData();
    } else {
      setError(res.message || 'Failed to delete class.');
    }
  };

  // Section Management
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setSectionForm({
      classId: classes.length > 0 ? classes[0].id : '',
      title: '',
      room: 'Room 101',
      capacity: 30,
      status: 'Active'
    });
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec) => {
    setEditingSection(sec);
    setSectionForm({
      classId: sec.classId,
      title: sec.title,
      room: sec.room || '',
      capacity: sec.capacity || 30,
      status: sec.status || 'Active'
    });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    setError('');
    if (editingSection) {
      const res = await api.put(`/school/sections/${editingSection.id}`, sectionForm, token);
      if (res.success) {
        setIsSectionModalOpen(false);
        setEditingSection(null);
        setSuccess('Section updated successfully.');
        fetchAcademicData();
      } else {
        setError(res.message || 'Failed to update section.');
      }
    } else {
      const res = await api.post('/school/sections', sectionForm, token);
      if (res.success) {
        setIsSectionModalOpen(false);
        setSuccess('Section created successfully.');
        fetchAcademicData();
      } else {
        setError(res.message || 'Failed to create section.');
      }
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    const res = await api.delete(`/school/sections/${id}`, token);
    if (res.success) {
      setSuccess('Section deleted successfully.');
      fetchAcademicData();
    } else {
      setError(res.message || 'Failed to delete section.');
    }
  };

  // Subject Management
  const handleAddSubject = async (e) => {
    e.preventDefault();
    setError('');
    const res = await api.post('/school/subjects', subjectForm, token);
    if (res.success) {
      setIsSubjectModalOpen(false);
      setSubjectForm({ title: '', code: '', department: 'Science', credits: 3 });
      setSuccess('Subject created successfully.');
      fetchAcademicData();
    } else {
      setError(res.message || 'Failed to create subject.');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    const res = await api.delete(`/school/subjects/${id}`, token);
    if (res.success) {
      setSuccess('Subject deleted successfully.');
      fetchAcademicData();
    } else {
      setError(res.message || 'Failed to delete subject.');
    }
  };

  // Table Columns
  const classColumns = [
    { header: 'Class ID', accessor: 'id' },
    { header: 'Class Title', accessor: 'title' },
    { header: 'Code', accessor: 'code' },
    { header: 'Grade Level', accessor: 'level' },
    { header: 'Status', accessor: 'status' }
  ];

  const enrichedSections = sections.map((sec) => {
    const parentCls = classes.find((c) => c.id === sec.classId);
    return {
      ...sec,
      className: parentCls ? parentCls.title : sec.classId,
      fullTitle: `${parentCls ? parentCls.code : ''} — ${sec.title}`
    };
  });

  const sectionColumns = [
    { header: 'Section ID', accessor: 'id' },
    { header: 'Grade / Class', accessor: 'className' },
    { header: 'Section Name', accessor: 'title' },
    { header: 'Assigned Room', accessor: 'room' },
    { header: 'Capacity', accessor: 'capacity' },
    { header: 'Status', accessor: 'status' }
  ];

  const subjectColumns = [
    { header: 'Subject Code', accessor: 'code' },
    { header: 'Title', accessor: 'title' },
    { header: 'Department', accessor: 'department' },
    { header: 'Credits', accessor: 'credits' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header and Tab Bar */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Layers size={22} color="var(--primary)" /> Academic Structure & Organization
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Manage Grades, Sections, and Academic Courses dynamically across all levels
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('sections')}
            className={`btn ${activeTab === 'sections' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
          >
            <Building size={15} /> Class Sections ({sections.length})
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
          >
            <Layers size={15} /> Grade Levels ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
          >
            <BookOpen size={15} /> Subject Catalog ({subjects.length})
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Tab 1: Sections */}
      {activeTab === 'sections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>
                Class Sections (Grade 9A, 9B, 10A, 11A, 12A...)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Every section has its own independent timetable and student cohort
              </p>
            </div>
          </div>
          <DataTable
            columns={sectionColumns}
            data={enrichedSections}
            searchPlaceholder="Search sections by grade, section name, room..."
            onAddClick={handleOpenAddSection}
            addButtonText="Create New Section"
            renderActions={(row) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleOpenEditSection(row)}
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                  title="Edit Section Details"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteSection(row.id)}
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                  title="Delete Section"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* Tab 2: Classes */}
      {activeTab === 'classes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>
                Grade Levels & Cohorts (Grade 9 - Grade 12)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Define school grade tiers that contain one or more dynamic class sections
              </p>
            </div>
          </div>
          <DataTable
            columns={classColumns}
            data={classes}
            searchPlaceholder="Search grade levels..."
            onAddClick={() => setIsClassModalOpen(true)}
            addButtonText="Add New Grade Level"
            renderActions={(row) => (
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteClass(row.id)}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                title="Delete Grade"
              >
                <Trash2 size={13} />
              </button>
            )}
          />
        </div>
      )}

      {/* Tab 3: Subjects */}
      {activeTab === 'subjects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>
                Subject Catalog & Course Directory
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Accredited subjects available for scheduling and grading
              </p>
            </div>
          </div>
          <DataTable
            columns={subjectColumns}
            data={subjects}
            searchPlaceholder="Search subject catalog..."
            onAddClick={() => setIsSubjectModalOpen(true)}
            addButtonText="Add New Subject"
            renderActions={(row) => (
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteSubject(row.id)}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                title="Delete Subject"
              >
                <Trash2 size={13} />
              </button>
            )}
          />
        </div>
      )}

      {/* Modal: Add/Edit Section */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={editingSection ? `Edit Section: ${editingSection.title}` : 'Create New Class Section'}
      >
        <form onSubmit={handleSaveSection}>
          <div className="form-group">
            <label className="form-label">Parent Grade / Class *</label>
            <select
              className="form-select"
              required
              disabled={!!editingSection}
              value={sectionForm.classId}
              onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Section Title *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Section A, Section B"
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Room / Lab</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Room 101, Lab 2"
                value={sectionForm.room}
                onChange={(e) => setSectionForm({ ...sectionForm, room: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Student Capacity</label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-input"
                value={sectionForm.capacity}
                onChange={(e) => setSectionForm({ ...sectionForm, capacity: parseInt(e.target.value) || 30 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={sectionForm.status}
                onChange={(e) => setSectionForm({ ...sectionForm, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSectionModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSection ? 'Save Changes' : 'Create Section'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Class */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Add New Grade Level">
        <form onSubmit={handleAddClass}>
          <div className="form-group">
            <label className="form-label">Grade Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Grade 10 (Sophomore)"
              value={classForm.title}
              onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Code *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="G10"
                value={classForm.code}
                onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Grade Level (1-12) *</label>
              <input
                type="number"
                min="1"
                max="12"
                required
                className="form-input"
                value={classForm.level}
                onChange={(e) => setClassForm({ ...classForm, level: parseInt(e.target.value) || 9 })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Grade Level
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Subject */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add New Subject">
        <form onSubmit={handleAddSubject}>
          <div className="form-group">
            <label className="form-label">Subject Code *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. CS-401"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Advanced Data Structures"
              value={subjectForm.title}
              onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Computer Science"
                value={subjectForm.department}
                onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Credits *</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                className="form-input"
                value={subjectForm.credits}
                onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 3 })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSubjectModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
