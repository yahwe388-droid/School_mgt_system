# 🚀 School Management System — Production Deployment & Maintenance Guide

This document provides complete instructions for building, testing, deploying, and maintaining the **School Management System** in local, staging, and production environments.

---

## 🛠️ Environment Configuration

Copy `.env.example` to `.env` in your project root:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express REST API backend |
| `NODE_ENV` | `production` | Environment mode (`development` / `production`) |
| `JWT_SECRET` | `school_mgt_secret_key_2026_prod` | Secret key for signing JWT authentication tokens |
| `CORS_ORIGIN` | `*` | Allowed CORS origins for frontend client access |

---

## 🧪 Testing & Verification

Run the automated unit and integration test suite before building for production:

```bash
npm test
```

Expected output:
```text
🧪 SCHOOL MANAGEMENT SYSTEM - AUTOMATED TEST SUITE
  ✅ PASS: Database initialized with pre-seeded users
  ✅ PASS: Admin user present with Admin role
  ✅ PASS: JWT Token generation and verification
  ✅ PASS: Timetable Conflict Engine detects overlapping teacher period
  ✅ PASS: Grade Calculator computes 95% as Grade A (GPA 4.0)
  ✅ PASS: Attendance Calculator computes 67% attendance rate
  ✅ PASS: Report Card Generator compiles student academic dossier
📊 TEST SUITE SUMMARY: 7 PASSED, 0 FAILED
```

---

## 📦 Production Build

Build the optimized Vite frontend bundle:

```bash
npm run build
```

This generates production-grade static assets in the `dist/` directory.

---

## 🌐 Running in Production

To start the API backend server in production mode:

```bash
npm run server
```

Or run both the Express backend and Vite preview concurrently:

```bash
npm run dev:all
```

---

## 🏥 Health Check & Monitoring Endpoint

Verify server uptime, memory usage, and health status:

```bash
curl http://localhost:5000/api/health
```

Sample JSON response:
```json
{
  "status": "ok",
  "environment": "production",
  "uptimeSeconds": 1420,
  "memoryUsageMB": {
    "rss": 42,
    "heapTotal": 28,
    "heapUsed": 18
  },
  "timestamp": "2026-08-26T14:00:00.000Z"
}
```

---

## 🔄 Resetting Baseline Data

To reset the database store to clean baseline seed data:

```bash
npm run db:reset
```
