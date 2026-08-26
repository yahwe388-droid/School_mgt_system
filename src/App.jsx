import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { TeacherList } from './components/TeacherList';
import { CourseList } from './components/CourseList';
import { AttendanceTracker } from './components/AttendanceTracker';
import { GradeBook } from './components/GradeBook';

export const App = () => {
  const { activeTab } = useApp();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <StudentList />;
      case 'teachers': return <TeacherList />;
      case 'courses': return <CourseList />;
      case 'attendance': return <AttendanceTracker />;
      case 'grades': return <GradeBook />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="content-area">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
