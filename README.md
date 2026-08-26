# 🏫 School Management System

A modern, high-performance, responsive **School Management System** built with **React 19**, **Vite**, **Lucide Icons**, and custom modern CSS variables (Glassmorphism & Dark Mode). 

Designed for educational institutions to seamlessly manage students, faculty, course catalogs, daily attendance, gradebooks, and real-time analytical insights.

---

## ✨ Features

- 📊 **Executive Dashboard**: Real-time KPIs for total student count, faculty size, average GPA, and attendance rates with recent activity logs.
- 👨‍🎓 **Student Directory**: Complete CRUD (Create, Read, Update, Delete) interface with search filtering, grade level tags, status badges, and details modal.
- 👩‍🏫 **Faculty Management**: Track teachers, department assignments, email contact info, and subject allocations.
- 📚 **Course Catalog**: Manage subjects, credit hours, department categorization, and student enrollment capacity.
- 📅 **Attendance Tracker**: Interactive daily attendance register with status controls (Present, Absent, Late) and instant attendance percentages.
- 📝 **Gradebook & GPA**: Grade entry management with automated GPA calculation and student academic standing indicators.
- 🌗 **Dark / Light Theme**: Built-in dynamic theme switcher using modern CSS HSL design tokens.
- 💾 **Local Storage Persistence**: Automatic persistence of edits, additions, and updates directly in the browser.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Google Fonts (*Outfit* & *Inter*)
- **Styling**: Vanilla CSS (Custom Design System, Glassmorphism, Responsive Grid)

---

## 📁 Folder Structure

```text
School_mgt_system/
├── public/                 # Static assets & favicon
├── src/
│   ├── assets/             # Images and visual media
│   ├── components/         # Reusable React UI components
│   │   ├── AttendanceTracker.jsx
│   │   ├── CourseList.jsx
│   │   ├── Dashboard.jsx
│   │   ├── GradeBook.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StudentList.jsx
│   │   ├── StudentModal.jsx
│   │   └── TeacherList.jsx
│   ├── context/            # React Context State Management
│   │   └── AppContext.jsx
│   ├── data/               # Seed data for initial state
│   │   └── initialData.js
│   ├── App.jsx             # Main Application Routing Shell
│   ├── index.css           # Global Design Tokens & Theme Styles
│   └── main.jsx            # React Entry Point
├── .gitignore              # Git Ignore Rules
├── index.html              # HTML Root
├── LICENSE                 # MIT License
├── package.json            # NPM Dependencies & Scripts
├── README.md               # Documentation
└── vite.config.js          # Vite Build Configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.0 or later) installed on your system.

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yahwe388-droid/School_mgt_system.git
   cd School_mgt_system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
