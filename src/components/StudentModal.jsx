import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StudentModal = ({ isOpen, onClose, editStudent }) => {
  const { addStudent, updateStudent } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science',
    grade: 'Freshman',
    gpa: '3.50',
    status: 'Active'
  });

  useEffect(() => {
    if (editStudent) {
      setFormData({
        name: editStudent.name || '',
        email: editStudent.email || '',
        department: editStudent.department || 'Computer Science',
        grade: editStudent.grade || 'Freshman',
        gpa: editStudent.gpa || '3.50',
        status: editStudent.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'Computer Science',
        grade: 'Freshman',
        gpa: '3.50',
        status: 'Active'
      });
    }
  }, [editStudent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editStudent) {
      updateStudent({
        ...editStudent,
        ...formData,
        gpa: parseFloat(formData.gpa)
      });
    } else {
      addStudent({
        ...formData,
        gpa: parseFloat(formData.gpa),
        enrollmentDate: new Date().toISOString().split('T')[0]
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editStudent ? 'Edit Student Details' : 'Register New Student'}</h3>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="alex.morgan@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <select
                  className="form-select"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                >
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">GPA (0.00 - 4.00)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  className="form-input"
                  required
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editStudent ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
