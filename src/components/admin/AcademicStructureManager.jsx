import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';

export const AcademicStructureManager = () => {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  const [classForm, setClassForm] = useState({ title: '', code: '', level: 9 });
  const [subjectForm, setSubjectForm] = useState({ title: '', code: '', department: 'Science', credits: 3 });

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    const clsRes = await api.get('/school/classes');
    if (clsRes.success) setClasses(clsRes.classes);

    const subRes = await api.get('/school/subjects');
    if (subRes.success) setSubjects(subRes.subjects);
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    const res = await api.post('/school/classes', classForm, token);
    if (res.success) {
      setIsClassModalOpen(false);
      setClassForm({ title: '', code: '', level: 9 });
      fetchAcademicData();
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    const res = await api.post('/school/subjects', subjectForm, token);
    if (res.success) {
      setIsSubjectModalOpen(false);
      setSubjectForm({ title: '', code: '', department: 'Science', credits: 3 });
      fetchAcademicData();
    }
  };

  const handleDeleteClass = async (id) => {
    await api.post(`/school/classes/${id}`, {}, token); // or fetch delete
    fetchAcademicData();
  };

  const handleDeleteSubject = async (id) => {
    await api.post(`/school/subjects/${id}`, {}, token);
    fetchAcademicData();
  };

  const classColumns = [
    { header: 'Class ID', accessor: 'id' },
    { header: 'Class Title', accessor: 'title' },
    { header: 'Code', accessor: 'code' },
    { header: 'Grade Level', accessor: 'level' }
  ];

  const subjectColumns = [
    { header: 'Subject Code', accessor: 'code' },
    { header: 'Title', accessor: 'title' },
    { header: 'Department', accessor: 'department' },
    { header: 'Credits', accessor: 'credits' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Classes Management */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="var(--primary)" /> Class Levels & Grades
          </h3>
        </div>
        <DataTable
          columns={classColumns}
          data={classes}
          searchPlaceholder="Search classes..."
          onAddClick={() => setIsClassModalOpen(true)}
          addButtonText="Add New Class"
        />
      </div>

      {/* Subjects Management */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--accent-cyan)" /> Subject Catalog & Mapping
          </h3>
        </div>
        <DataTable
          columns={subjectColumns}
          data={subjects}
          searchPlaceholder="Search subjects..."
          onAddClick={() => setIsSubjectModalOpen(true)}
          addButtonText="Add New Subject"
        />
      </div>

      {/* Add Class Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Add New Academic Class">
        <form onSubmit={handleAddClass}>
          <div className="form-group">
            <label className="form-label">Class Title</label>
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
              <label className="form-label">Code</label>
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
              <label className="form-label">Grade Level (1-12)</label>
              <input
                type="number"
                required
                className="form-input"
                value={classForm.level}
                onChange={(e) => setClassForm({ ...classForm, level: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsClassModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Class</button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add New Subject">
        <form onSubmit={handleAddSubject}>
          <div className="form-group">
            <label className="form-label">Subject Code</label>
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
            <label className="form-label">Subject Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Data Structures & Algorithms"
              value={subjectForm.title}
              onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
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
              <label className="form-label">Credits</label>
              <input
                type="number"
                required
                className="form-input"
                value={subjectForm.credits}
                onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSubjectModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Subject</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
