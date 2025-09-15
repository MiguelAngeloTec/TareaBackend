/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export type User = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  salt: string;
};

@Injectable()
export class UserRepository {
  constructor(private readonly dbService: DbService) {}

  async registerUser(email: string, name: string, password_hash: string): Promise<void> {
    const sql = `
      INSERT INTO users (email, name, password_hash, salt)
      VALUES (?, ?, ?, ?)
    `;
    await this.dbService.getPool().query(sql, [email, name, password_hash, 'saltTest']);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().query(sql, [email]);
    const result = rows as User[];
    return result[0];
  }

  async findById(id: number): Promise<User | undefined> {
    const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().query(sql, [id]);
    const result = rows as User[];
    return result[0];
  }


  async updateUser(
    id: number,
    fields: { email?: string; name?: string; password_hash?: string }
  ): Promise<User> {
    const sets: string[] = [];
    const params: any[] = [];

    if (fields.email !== undefined) {
      sets.push('email = ?');
      params.push(fields.email);
    }
    if (fields.name !== undefined) {
      sets.push('name = ?');
      params.push(fields.name);
    }
    if (fields.password_hash !== undefined) {
      sets.push('password_hash = ?');
      params.push(fields.password_hash);
    }

    if (sets.length > 0) {
      const sql = `UPDATE users SET ${sets.join(', ')} WHERE id = ?`;
      params.push(id);
      await this.dbService.getPool().query(sql, params);
    }

    const updated = await this.findById(id);
    // asumiendo que existe porque el service ya valida NotFound
    return updated as User;
  }

  async findAll(): Promise<Array<{ email: string; name: string }>> {
    const sql = `SELECT email, name FROM users ORDER BY id ASC`;
    const [rows] = await this.dbService.getPool().query(sql);
    return rows as Array<{ email: string; name: string }>;
  }

  async searchUsers(email?: string, name?: string): Promise<User[]> {
    const where: string[] = [];
    const params: any[] = [];

    if (email) {
      where.push('LOWER(email) LIKE ?');
      params.push(`%${email.toLowerCase()}%`);
    }
    if (name) {
      where.push('LOWER(name) LIKE ?');
      params.push(`%${name.toLowerCase()}%`);
    }

    const sql = `
      SELECT * FROM users
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY id ASC
    `;
    const [rows] = await this.dbService.getPool().query(sql, params);
    return rows as User[];
  }
}
