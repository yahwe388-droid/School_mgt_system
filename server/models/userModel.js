import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

export const VALID_ROLES = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];

export const UserModel = {
  VALID_ROLES,

  findByEmail: (email) => {
    return db.findUserByEmail(email);
  },

  findByUsername: (username) => {
    return db.findUserByUsername(username);
  },

  findByUsernameOrEmail: (identifier) => {
    return db.findUserByUsernameOrEmail(identifier);
  },

  findById: (id, includeHash = false) => {
    const user = db.findUserById(id);
    if (!user) return null;
    if (includeHash) return user;
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  verifyPassword: (inputPassword, hash) => {
    if (!inputPassword || !hash) return false;
    return bcrypt.compareSync(inputPassword, hash);
  },

  hashPassword: (plainPassword) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plainPassword, salt);
  },

  sanitizeUser: (user) => {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  getAllUsers: (filters = {}) => {
    let users = db.getUsers().map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });

    if (filters.role && filters.role !== 'All') {
      const targetRole = filters.role.toUpperCase();
      users = users.filter(u => u.role?.toUpperCase() === targetRole);
    }

    if (filters.isActive !== undefined && filters.isActive !== null && filters.isActive !== '') {
      const isActiveBool = filters.isActive === 'true' || filters.isActive === true;
      users = users.filter(u => u.is_active === isActiveBool);
    }

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q))
      );
    }

    return users;
  },

  createUser: ({ username, studentId, aliasUsername, email, password, role, first_name, last_name, phone, department, grade, children, created_by }) => {
    const normalizedRole = (role || 'STUDENT').toUpperCase();
    if (!VALID_ROLES.includes(normalizedRole)) {
      throw new Error(`Invalid role '${role}'. Allowed roles are: ${VALID_ROLES.join(', ')}`);
    }

    // Check unique username
    if (db.findUserByUsername(username)) {
      throw new Error(`Username '${username}' is already taken.`);
    }

    // Check unique email
    if (email && db.findUserByEmail(email)) {
      throw new Error(`Email '${email}' is already registered.`);
    }

    if (!password || typeof password !== 'string' || password.trim().length < 8) {
      throw new Error('Password is required and must be at least 8 characters long.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password.trim(), salt);

    const cleanUsername = username.trim();
    const user = db.createUser({
      username: cleanUsername,
      studentId: studentId || (normalizedRole === 'STUDENT' ? cleanUsername : undefined),
      aliasUsername: aliasUsername ? aliasUsername.trim().toLowerCase() : undefined,
      email: email ? email.toLowerCase().trim() : `${cleanUsername.toLowerCase()}@school.com`,
      passwordHash,
      role: normalizedRole,
      first_name,
      last_name,
      phone: phone || '',
      department: department || '',
      grade: grade || '',
      children: children || [],
      created_by: created_by || 'ADMIN',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&q=80&w=250`
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },

  updateUser: (id, updateData) => {
    const updated = db.updateUser(id, updateData);
    if (!updated) return null;
    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  },

  setActiveStatus: (id, isActive) => {
    const updated = db.setUserActiveStatus(id, isActive);
    if (!updated) return null;
    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  },

  resetPassword: (id, newPlainPassword) => {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPlainPassword, salt);
    const updated = db.resetUserPassword(id, passwordHash);
    if (!updated) return null;
    const { passwordHash: _, ...safeUser } = updated;
    return safeUser;
  },

  recordLogin: (id) => {
    db.recordUserLogin(id);
  }
};

