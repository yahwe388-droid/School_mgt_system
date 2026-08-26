# 🏫 School Management System (Complete 5-Phase Production Release)

A modern, full-stack, production-ready **School Management System** platform built with **React 19**, **Vite**, **Express**, **JWT Authentication**, **RBAC Security**, **Lucide Icons**, and custom CSS HSL Design Tokens (Glassmorphism & Dark Mode).

Designed for educational institutions to manage administrative setup, student/teacher/parent records, class timetables with conflict detection, daily attendance, assignments, exam gradebooks, printable report cards, role-targeted announcements, and visual analytics.

---

## 🌟 5-Phase Architecture Overview

- 🔒 **Phase 1: Foundation & RBAC**: JWT authentication, bcrypt password hashing, role middleware, protected route guards, base navigation shell, and demo account switcher for **Admin**, **Teacher**, **Student**, and **Parent**.
- 🏫 **Phase 2: Core School Records Layer**: School profile setup, academic year management, class levels & sections, subject mapping, and CRUD record managers for Students, Teachers, and Parents.
- 📅 **Phase 3: Academic Management Layer**: Timetables with conflict detection engine, daily attendance register, homework assignments & submissions, exam/quiz scheduler, mark entry board, and report card data.
- 📢 **Phase 4: Communication, Reporting & Operational Visibility**: Role-targeted announcement noticeboard, in-app notification center, printable student progress report cards, and visual institutional analytics.
- 🚀 **Phase 5: Final Production Readiness**: Rate-limiting, security headers (XSS/HSTS/Frame-Options), admin audit trail logging, health monitoring (`/api/health`), automated unit test suite, `.env.example` setup, database reset script, and deployment documentation.

---

## 🗝️ Demo Accounts (Phase 1 - 5)

| Role | Email | Password | Primary Module Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `admin123` | Full System Access, Record Managers, Timetables, Reports, Analytics |
| **Teacher** | `teacher@school.com` | `teacher123` | Assigned Classes, Attendance Register, Homework Grading, Marks Entry |
| **Student** | `student@school.com` | `student123` | Class Schedule, Pending Homework Submission, Exam Schedule, Report Card |
| **Parent** | `parent@school.com` | `parent123` | Child's Attendance Register, Child Homework, Official Printable Report Card |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite, Lucide React Icons, Custom CSS HSL Tokens & Glassmorphism
- **Backend API**: Node.js, Express, CORS, JSON Web Tokens (`jsonwebtoken`), `bcryptjs` Password Security
- **State & Router**: Context API (`AuthContext`), Protected Route Guard (`ProtectedRoute`), Error Boundary
- **Security & Quality**: In-Memory Rate Limiter, HTTP Security Headers, Audit Logger, Automated Test Suite (`testRunner.js`)

---

## 🔌 API Endpoints Summary

### Authentication & Users
- `POST /api/auth/login` - User login & JWT issuance
- `GET /api/auth/me` - Token session verification
- `POST /api/auth/logout` - User sign-out
- `GET /api/users` - User list (Admin only)

### School & Record Management (Phase 2)
- `GET /api/school/profile` & `PUT /api/school/profile` - School profile setup
- `GET /api/school/classes` & `POST /api/school/classes` - Class levels & sections
- `GET /api/school/subjects` & `POST /api/school/subjects` - Subject catalog
- `GET /api/records/students` & `POST /api/records/students` - Student records CRUD
- `GET /api/records/teachers` & `POST /api/records/teachers` - Faculty records CRUD
- `GET /api/records/parents` & `POST /api/records/parents` - Parent records CRUD

### Academic Operations (Phase 3)
- `GET /api/academic/timetables` & `POST /api/academic/timetables` - Timetable schedule & conflict check
- `GET /api/academic/attendance` & `POST /api/academic/attendance` - Daily attendance register
- `GET /api/academic/assignments` & `POST /api/academic/submissions` - Homework & grading
- `GET /api/academic/exams` & `POST /api/academic/results` - Exams & grade calculation

### Communication & Reporting (Phase 4)
- `GET /api/communication/announcements` & `POST /api/communication/announcements` - School notices
- `GET /api/communication/notifications` & `POST /api/communication/notifications/:id/read` - Notifications
- `GET /api/communication/reports/student/:studentId` - Printable report card data
- `GET /api/communication/analytics` - Institutional pass rates & metrics

### System Health & Security (Phase 5)
- `GET /api/health` - Server health status, uptime seconds, and memory metrics

---

## 🧪 Testing & Verification

Run the automated unit and integration test suite:

```bash
npm test
```

Build production bundle:

```bash
npm run build
```

Reset database store to baseline data:

```bash
npm run db:reset
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

<!-- Contributor Graph Sync: Greenwood School Management System -->
