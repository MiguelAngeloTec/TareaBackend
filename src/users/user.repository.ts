/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export type User= {
    id: number;
    email: string;
    name: string;
    password_hash: string;
    salt: string;
}


@Injectable()
export class UserRepository{
    constructor(private readonly dbService: DbService) {}

    async registerUser(email:string, 
        name:string, password:string):Promise<User|void>{
        const sql= `INSERT INTO users (email,name,password_hash,salt) VALUES ('${email}','${name}','${password}','saltTest')`;
        await this.dbService.getPool().query(sql);
    }

    async findByEmail(email:string):Promise<User>{
        const sql= `SELECT * FROM users WHERE email='${email}' LIMIT 1`;
        const [rows]= await this.dbService.getPool().query(sql);
        const result= rows as User[];
        return result[0];
    }
    async findById(id:number):Promise<User>{
        const sql= `SELECT * FROM users WHERE id='${id}' LIMIT 1`;
        const [rows]= await this.dbService.getPool().query(sql);
        const result= rows as User[];
        return result[0];
    }
    async updateUser(userId: number, updateData: { 
        name?: string; 
        email?: string; 
        password_hash?: string; 
    }): Promise<User> {
        let sql = 'UPDATE users SET ';
        const values: any[] = [];
        let firstField = true;

        if (updateData.name !== undefined) {
            sql += 'name = ?';
            values.push(updateData.name);
            firstField = false;
        }
        
        if (updateData.email !== undefined) {
            if (!firstField) sql += ', ';
            sql += 'email = ?';
            values.push(updateData.email);
            firstField = false;
        }
        
        if (updateData.password_hash !== undefined) {
            if (!firstField) sql += ', ';
            sql += 'password_hash = ?';
            values.push(updateData.password_hash);
            firstField = false;
        }
        
        // Si no hay campos para actualizar, devolver usuario actual
        if (firstField) {
            return this.findById(userId);
        }
        
        sql += ' WHERE id = ?';
        values.push(userId);
        
        await this.dbService.getPool().execute(sql, values);
        
        return this.findById(userId);
    }
}


