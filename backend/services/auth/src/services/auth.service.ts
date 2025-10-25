import jwt from 'jsonwebtoken';
import knex from '../config/database';
import redis from '../config/redis';

export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  first_name: string;
  last_name: string;
  role: string;
  phone: string | null;
  agency_id: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class AuthService {
  async findUserByEmail(email: string): Promise<User | undefined> {
    return knex('users').where({ email }).first();
  }

  async findUserById(id: string): Promise<User | undefined> {
    return knex('users').where({ id }).first();
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const [user] = await knex('users').insert(userData).returning('*');
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await knex('users')
      .where({ id: userId })
      .update({ last_login_at: knex.fn.now() });
  }

  generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );
  }

  generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      }
    );
  }

  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresIn = 30 * 24 * 60 * 60; // 30 days in seconds
    await redis.setex(`refresh_token:${userId}`, expiresIn, token);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return redis.get(`refresh_token:${userId}`);
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await redis.del(`refresh_token:${userId}`);
  }

  sanitizeUser(user: User) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}
