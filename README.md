# 🏫 EduCore — School Management System

EduCore is a modern, full-stack School Management System built with **React 19**, **Vite**, **Node.js**, **Express**, and **JWT-based Role-Based Access Control (RBAC)**.

It provides four dedicated role portals for **Administrators**, **Teachers**, **Students**, and **Parents/Guardians**.

---

## 🌟 Key Features by Role

- **👑 Administrator Portal (`/admin/*`)**
  - Provision Teacher, Student, and Parent accounts with automated or custom passwords.
  - Auto-generate formatted Student IDs (`KM/{SEQUENCE}/{YEAR}`).
  - Manage school configurations, academic years, terms, classes, sections, and audit logs.

- **👨‍🏫 Teacher Portal (`/teacher/*`)**
  - Roll-call attendance register with automated rate calculation.
  - Create and publish coursework assignments with deadline tracking.
  - Gradebook with automatic GPA (4.0 scale) and letter grade computation (`A+` to `F`).
  - View weekly teaching schedule and communicate with students/parents.

- **🎓 Student Portal (`/student/*`)**
  - View enrolled subjects, instructors, and lecture schedules.
  - Track assignments, submit coursework, and view grades/GPA transcript.
  - Monitor personal attendance compliance rates (>= 80% threshold).

- **👨‍👩‍👦 Parent / Guardian Portal (`/parent/*`)**
  - Monitor linked children's attendance, grades, and upcoming homework.
  - Generate official printable academic report cards.
  - Direct messaging with teachers.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons, Modern Vanilla CSS Design Tokens |
| **Backend** | Node.js, Express, CORS, bcryptjs, JSON Web Tokens (JWT) |
| **Security** | Role-Based Access Control (RBAC), Object-Level Authorization, Login Rate Limiting |
| **Testing** | Automated Node.js Test Suite (74 passing scenarios) |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)

### 1. Installation
```bash
git clone https://github.com/yahwe388-droid/School_mgt_system.git
cd School_mgt_system
npm install
```

### 2. Run the Development Servers
Open two terminal windows:

```bash
# Terminal 1 — Backend Express Server (http://localhost:5000)
npm run server

# Terminal 2 — Frontend Vite App (http://localhost:3000)
npm run dev
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔑 Default Credentials

| Role | Name | Username / Email | Password |
| :--- | :--- | :--- | :--- |
| **Administrator** | Kebek Guta | `admin` / `kebi12447@gmail.com` | `admin123` |
| **Teacher** | Dr. Robert Vance | `robert.vance` / `teacher@school.com` | `teacher123` |
| **Student** | Alex Morgan | `KM/34567/18` / `student@school.com` | `student123` |
| **Parent** | Sarah Morgan | `sarah.morgan` / `parent@school.com` | `parent123` |

---

## 📁 Project Structure

```text
├── public/                 # Static assets & logos
├── server/
│   ├── config/             # Database store & seed data (db.js)
│   ├── controllers/        # Request controllers (auth, users, records, etc.)
│   ├── middleware/         # Security, rate limiter, JWT & RBAC guards
│   ├── routes/             # Express API endpoints
│   ├── scripts/            # Automated test runner & seed scripts
│   └── index.js            # Express server entry point
├── src/
│   ├── components/         # Portal components (admin, teacher, student, parent)
│   ├── context/            # AuthContext & state management
│   ├── services/           # Frontend API client
│   ├── App.jsx             # Root routing & layout container
│   └── main.jsx            # React app entry point
├── package.json
└── vite.config.js
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
