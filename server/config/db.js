import bcrypt from 'bcryptjs';

// Pre-hashed passwords for quick initial setup (password: role + '123' e.g. admin123)
const salt = bcrypt.genSaltSync(10);

export const initialUsers = [
  {
    id: "USR-001",
    name: "System Administrator",
    email: "admin@school.com",
    passwordHash: bcrypt.hashSync("admin123", salt),
    role: "Admin",
    department: "Administration",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "USR-002",
    name: "Dr. Robert Vance",
    email: "teacher@school.com",
    passwordHash: bcrypt.hashSync("teacher123", salt),
    role: "Teacher",
    department: "Computer Science",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    createdAt: "2026-01-02T00:00:00.000Z"
  },
  {
    id: "USR-003",
    name: "Alex Morgan",
    email: "student@school.com",
    passwordHash: bcrypt.hashSync("student123", salt),
    role: "Student",
    department: "Computer Science",
    grade: "Senior",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
    createdAt: "2026-01-03T00:00:00.000Z"
  },
  {
    id: "USR-004",
    name: "David Morgan",
    email: "parent@school.com",
    passwordHash: bcrypt.hashSync("parent123", salt),
    role: "Parent",
    children: ["USR-003"], // Linked student: Alex Morgan
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    createdAt: "2026-01-04T00:00:00.000Z"
  }
];

class DatabaseStore {
  constructor() {
    this.users = [...initialUsers];
    this.roles = ["Admin", "Teacher", "Student", "Parent"];
  }

  getUsers() {
    return this.users;
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  addUser(userData) {
    const newUser = {
      id: `USR-00${this.users.length + 1}`,
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }
}

export const db = new DatabaseStore();
