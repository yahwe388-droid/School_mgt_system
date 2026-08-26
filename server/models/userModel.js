import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

export const UserModel = {
  findByEmail: (email) => {
    return db.findUserByEmail(email);
  },

  findById: (id) => {
    const user = db.findUserById(id);
    if (!user) return null;
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  verifyPassword: (inputPassword, hash) => {
    return bcrypt.compareSync(inputPassword, hash);
  },

  sanitizeUser: (user) => {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  getAllUsers: () => {
    return db.getUsers().map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
  }
};
