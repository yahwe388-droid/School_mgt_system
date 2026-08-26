import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialStudents, initialTeachers, initialCourses, initialAttendance } from '../data/initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('academiX_theme') || 'light');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data States with localStorage persistence
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('academiX_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [teachers, setTeachers] = useState(() => {
    const saved = localStorage.getItem('academiX_teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('academiX_courses');
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('academiX_attendance');
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Sync state changes to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('academiX_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('academiX_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('academiX_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('academiX_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('academiX_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Student CRUD Operations
  const addStudent = (student) => {
    const newStudent = {
      ...student,
      id: `STU-${1000 + students.length + 1}`,
      avatar: student.avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&q=80&w=250`
    };
    setStudents([newStudent, ...students]);
  };

  const updateStudent = (updated) => {
    setStudents(students.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStudent = (id) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const updateAttendance = (studentId, status) => {
    setAttendance((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        teachers,
        courses,
        attendance,
        updateAttendance,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
