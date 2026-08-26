import React, { useState } from 'react';
import { UserPlus, Edit2, Trash2, Filter, Mail, Award, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudentModal } from './StudentModal';

export const StudentList = () => {
  const { students, deleteStudent, searchQuery } = useApp();
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const departments = ['All', 'Computer Science', 'Electrical Engineering', 'Business Administration', 'Data Science', 'Mechanical Engineering'];

  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDepartment === 'All' || s.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Action Header & Department Filter */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Department Filter:</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`btn ${selectedDepartment === dept ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '20px' }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <UserPlus size={16} /> Add New Student
        </button>
      </div>

      {/* Student Data Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Department</th>
                <th>Year</th>
                <th>GPA</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students match your query. Try adjusting filters or search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <img
                          src={s.avatar}
                          alt={s.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Mail size={12} /> {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600', fontFamily: 'monospace', color: 'var(--primary)' }}>{s.id}</td>
                    <td>{s.department}</td>
                    <td>{s.grade}</td>
                    <td>
                      <span style={{ fontWeight: '700', color: s.gpa >= 3.5 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                        {s.gpa.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Edit Student"
                          onClick={() => handleOpenEditModal(s)}
                        >
                          <Edit2 size={15} color="var(--primary)" />
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          title="Delete Student"
                          onClick={() => deleteStudent(s.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editStudent={editingStudent}
      />
    </div>
  );
};
