# 🏫 EduCore — Enterprise School Management System

**EduCore** is a comprehensive, production-ready School Management System built with **React 19**, **Vite**, **Express**, **Node.js**, **JWT Authentication**, and **Role-Based Access Control (RBAC)**.

It provides end-to-end operational portals for **Administrators**, **Teachers**, **Students**, and **Parents/Guardians**, backed by a real database store, object-level authorization, automated GPA/attendance calculation engines, inter-role messaging, and zero placeholder UI.

---

## 🔒 Strict Role-Based Security & Authentication Architecture

EduCore strictly enforces an enterprise security model with **zero public/self-registration**:

```
                    Admin Provisions Account
                                ↓
        Credentials Stored in Secure Database (bcrypt hash)
                                ↓
        Admin Assigns Username & Temporary/Custom Password
                                ↓
             Teacher / Student / Parent Logs In
                                ↓
      Backend Validates Credentials & Retrievs Database Role
                                ↓
       System Issues Signed JWT Token & Enforces Password Policy
           (Mandatory password update on initial login)
                                ↓
      User Redirected to Role Dashboard (/admin, /teacher, etc.)
                                ↓
  Object-Level Authorization Middleware Guards All Data Endpoints
```

### 1. The Four Operational Roles
1. **ADMIN**: Full institutional authority. The **only** role authorized to provision accounts for Teachers, Students, and Parents, configure school settings, generate academic structures, and review system audit trails.
2. **TEACHER**: Authorized faculty portal. Restricted to assigned classes, student rosters, roll-call attendance, coursework publishing, inline submission grading with automated GPA calculations, and student/parent communications.
3. **STUDENT**: Dedicated learning portal. Strictly scoped to enrolled curriculum, homework submissions, official examination grades & GPA standing (read-only), attendance compliance records, and faculty inquiries. Student ID and Role are strictly immutable.
4. **PARENT / GUARDIAN**: Dependent monitoring portal. Scoped strictly to linked student wards. Read-only access to child attendance records, academic report cards, upcoming homework, and teacher correspondence. Cross-child record inspection is blocked with **HTTP 403 Forbidden**.

---

## 🌟 Portals & Feature Modules

### 👑 1. Admin Portal (`/admin/*`)
- **Executive Operations Dashboard**: Real-time KPI summaries, active vs inactive account metrics, enrollment tallies, and system audit logs.
- **User Provisioning & Credentials Manager**:
  - Secure creation of Teacher, Student, and Parent accounts.
  - Optional custom password (minimum 8 characters, bcrypt hashed) or automatic secure temporary password.
  - `must_change_password` flag enforced on initial login.
  - Password reset with live temporary credential generation.
  - Account status toggle (Active/Inactive) with immediate authentication rejection for deactivated users.
- **Student ID Generation Engine**:
  - Automatic generation in official format `KM/{SEQUENCE}/{YEAR}` (e.g. `KM/34567/18`).
  - Strict alphabetical ordering allocation and uniqueness guarantees across concurrent creations.
- **Academic Structure & School Settings**:
  - Academic years, terms, classes, sections, and department configurations.
  - Institutional profiles, motto, grading scale policies, and contact details.

### 👨‍🏫 2. Teacher Portal (`/teacher/*`)
- **Assigned Classes & Student Rosters** (`/teacher/classes`, `/teacher/students`):
  - Real-time directory of assigned cohorts and registered students.
  - Detailed student academic dossiers.
- **Classroom Attendance Register** (`/teacher/attendance`):
  - Cohort roll-call marking (Present, Absent, Late) with date selection and duplicate prevention.
  - Authorization guards preventing attendance modification for non-assigned classes (**HTTP 403**).
- **Coursework & Assessment Center** (`/teacher/assignments`):
  - Publish homework tasks, due dates, instructions, and point weights.
  - Inspect student submissions, download/view repository links, and record inline feedback.
- **Gradebook & GPA Calculator** (`/teacher/grades`):
  - Record examination marks with automatic percentage, letter grade (`A+` to `F`), GPA (`4.0` scale), and faculty remark computation.
- **Faculty Timetable & Profile** (`/teacher/schedule`, `/teacher/profile`):
  - Weekly instructional timetable with conflict detection.
  - Faculty contact management with strictly immutable roles.

### 🎓 3. Student Portal (`/student/*`)
- **Enrolled Academic Courses** (`/student/courses`):
  - Semester course list, credit units, faculty instructor details, and lecture times.
- **Coursework Submissions** (`/student/assignments`):
  - Active homework monitor with due date countdowns.
  - Interactive homework submission modal (written answer or repository/project link).
  - Real-time submission status tracking (Pending &rarr; Submitted &rarr; Graded).
- **Grade Transcript & Performance** (`/student/grades`):
  - Official transcript of all examination marks, GPA standing, and faculty remarks.
  - Printable official student grade report.
- **Attendance Record & Compliance** (`/student/attendance`):
  - Daily roll-call attendance rate (compliant &ge; 80% vs warning).
  - Session history log with status indicators.
- **Student Profile & Identity** (`/student/profile`):
  - Immutable Student ID (`KM/...`), academic class cohort, and security role.

### 👨‍👩‍👦 4. Parent / Guardian Portal (`/parent/*`)
- **Linked Student Wards** (`/parent/children`):
  - Profiles of verified student dependents with class level, attendance rate, and GPA.
  - Comprehensive dependent academic dossier modals.
- **Child Attendance Monitoring** (`/parent/attendance`):
  - Dependent selector for families with multiple enrolled children.
  - Detailed classroom roll-call history and attendance compliance metrics.
- **Official Academic Report Cards** (`/parent/grades`):
  - Verified examination marks, GPAs, letter grades, and printable report cards.
  - Object-level security prevents unauthorized inspection of unlinked students (**HTTP 403**).
- **Homework & Coursework Tracker** (`/parent/assignments`):
  - Up-to-date monitor of assigned homework and due dates for the child's class.
- **Guardian Profile** (`/parent/profile`):
  - Family contact details and residential address updates.

### 💬 5. Unified Real-Time Database Messaging
- **Inter-Role Communication Center** (`/teacher/messages`, `/student/messages`, `/parent/messages`):
  - Real database-persisted message transmission.
  - Teacher &harr; Student academic discussions.
  - Teacher &harr; Parent progress updates.
  - Inbox, Sent messages, interactive Compose modal, and live Mark-As-Read tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons, Modern Vanilla CSS Design Tokens (Dark Mode, Glassmorphism) |
| **Backend** | Node.js, Express, CORS, JSON Web Tokens (`jsonwebtoken`), `bcryptjs` Password Hashing |
| **State & Navigation** | Context API (`AuthContext`), Protected Route Guard (`ProtectedRoute`), Browser History Sync |
| **Security & Auth** | JWT Authentication, Role Authorization, Object-Level Authorization, Brute-Force Rate Limiting |
| **Testing** | Automated Node.js Test Runner with 57 comprehensive tests (`testRunner.js`) |

---

## 🔌 API Endpoints Reference

### 🔐 Authentication & Accounts
- `POST /api/auth/login` — User login, credential verification & JWT issuance
- `GET /api/auth/me` — Token session verification & user profile retrieval
- `POST /api/auth/change-password` — Force first-time or user-initiated password update
- `POST /api/auth/logout` — Secure sign-out & session destruction

### 🛡️ Admin Management (`/api/admin/*`)
- `GET /api/admin/metrics` — System health, user counts, and authentication logs
- `GET /api/admin/users` — Directory of all provisioned institutional accounts
- `POST /api/admin/users` — Provision new Teacher, Student, or Parent account
- `POST /api/admin/users/:id/reset-password` — Reset account password with temporary password
- `PATCH /api/admin/users/:id/status` — Toggle account status (Active / Inactive)
- `GET /api/admin/settings` & `PUT /api/admin/settings` — Institutional configuration

### 👨‍🏫 Teacher Specific Endpoints (`/api/teacher/*`)
- `GET /api/teacher/dashboard` — Assigned metrics, schedule, and recent assignments
- `GET /api/teacher/classes` — Assigned cohorts and student rosters
- `GET /api/teacher/students` — Assigned student directory with search
- `GET /api/teacher/attendance` & `POST /api/teacher/attendance` — Roll-call register (with 403 guard)
- `GET /api/teacher/assignments` & `POST /api/teacher/assignments` — Publish coursework & grading
- `GET /api/teacher/grades` & `POST /api/teacher/grades` — Cohort gradebook & GPA calculation
- `GET /api/teacher/schedule` — Faculty weekly timetable
- `GET /api/teacher/messages` & `POST /api/teacher/messages` — Real database communication
- `GET /api/teacher/profile` & `PUT /api/teacher/profile` — Faculty profile management

### 🎓 Student Specific Endpoints (`/api/student/*`)
- `GET /api/student/dashboard` — Course count, attendance stats, and recent scores
- `GET /api/student/courses` — Enrolled curriculum subjects and faculty instructors
- `GET /api/student/assignments` — Active class homework assignments
- `POST /api/student/assignments/:id/submit` — Submit homework solution or link
- `GET /api/student/grades` — Official examination transcript (read-only)
- `GET /api/student/attendance` — Roll-call breakdown and attendance log
- `GET /api/student/schedule` — Weekly student class timetable
- `GET /api/student/messages` & `POST /api/student/messages` — Inquiries to instructors
- `GET /api/student/profile` & `PUT /api/student/profile` — Student profile (ID & role immutable)

### 👨‍👩‍👦 Parent Specific Endpoints (`/api/parent/*`)
- `GET /api/parent/dashboard` — Overview of linked dependents, grades, and attendance
- `GET /api/parent/children` — Linked children dossiers
- `GET /api/parent/attendance` — Child attendance log (unlinked access blocked with 403)
- `GET /api/parent/grades` — Child grade report cards (unlinked access blocked with 403)
- `GET /api/parent/assignments` — Upcoming homework assigned to child's cohort
- `GET /api/parent/schedule` — Weekly child class timetable
- `GET /api/parent/messages` & `POST /api/parent/messages` — Correspondence with faculty
- `GET /api/parent/profile` & `PUT /api/parent/profile` — Family contact details

---

## 🧪 Automated Testing & Verification

EduCore includes a 57-test automated verification suite:

```bash
# Execute the complete automated test suite
npm test
```

### Verification Coverage:
1. **Core Domain Services (12 tests)**: Database initialization, seed users, JWT tokens, timetable conflict detection, grade & GPA calculations, attendance percentage calculator, report card generator.
2. **Authentication & RBAC Suite (13 tests)**: Admin login, teacher provisioning, temporary passwords, role resolution, cross-role access rejection (403), inactive account rejection, forced password change workflow, session destruction, role tampering immunity.
3. **Master Audit & All-Portal Verification Suite (32 tests)**:
   - Sequential student ID generation format (`KM/{SEQUENCE}/{YEAR}`) and alphabetical allocation.
   - Brute-force rate limiting (HTTP 429) on consecutive failed login attempts.
   - Bcrypt password encryption and zero plaintext leakage.
   - Teacher attendance authorization (authorized class 200 vs unauthorized 403).
   - Teacher coursework publishing and grade recording with automated GPA calculation.
   - Student course and assignment scoping.
   - Student homework submission and status update.
   - Student privilege escalation rejection (403 on teacher grading or attendance).
   - Parent linked child scoping and 403 rejection on unlinked students.
   - Cross-portal real database messaging (Teacher &rarr; Student &rarr; Reply &rarr; Mark as Read).

---

## 🚀 Running the Application Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/yahwe388-droid/School_mgt_system.git

# Navigate to the project directory
cd School_mgt_system

# Install dependencies
npm install
```

### 2. Running Dev Servers
Run the backend server and frontend development server concurrently:

```bash
# Start backend API server on http://localhost:5000
npm run server

# In a separate terminal, start frontend dev server on http://localhost:3000
npm run dev
```

### 3. Production Build
```bash
# Compile and optimize production bundle
npm run build
```

---

## 🔑 Pre-Seeded Default Accounts

| Role | Username / Identifier | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Institutional Control, Account Provisioning, School Settings |
| **Faculty Teacher** | `robert.vance` | `teacher123` | Assigned Classes, Attendance Register, Coursework Grading |
| **Student** | `KM/34567/18` | `student123` | Enrolled Courses, Homework Submissions, Grades Transcript |
| **Parent/Guardian** | `sarah.morgan` | `parent123` | Linked Child Monitoring, Child Attendance & Report Cards |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
