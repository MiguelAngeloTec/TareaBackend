/* eslint-disable prettier/prettier */

import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { User, UserRepository } from "./user.repository";
import { sha256 } from "src/util/crypto/hash.util";
import { UpdateUserDto } from "./user.controller";

export type UserDto={
    email: string;
    name: string;
}

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async registerUser(email:string, name:string, password:string):Promise<UserDto|void>{
        console.log("Aqui hacemos el hash del password")
        const hashedPassword = sha256(password);
        return this.userRepository.registerUser(email, name, hashedPassword);
    }

    async login(email:string, password:string):Promise<User>{
        const user= await this.userRepository.findByEmail(email);
        if(!user) throw Error("Usuario no encontrado");
        if(user.password_hash !== sha256(password)){
            throw new UnauthorizedException("Contraseña incorrecta");
        }
        return user;
    }

    async findById(id:number):Promise<User>{
        return this.userRepository.findById(id);
    }

    async updateUser(userId: number, updateData: UpdateUserDto): Promise<UserDto> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Validar email solo si se está actualizando
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await this.userRepository.findByEmail(updateData.email);
            if (emailExists) {
                throw new ConflictException('El email ya está en uso');
            }
        }

        // Hashear la nueva contraseña si se proporciona
        let hashedPassword: string | undefined;
        if (updateData.password) {
            hashedPassword = sha256(updateData.password);
        }

        // Actualizar usuario (incluyendo contraseña si se proporciona)
        const updatedUser = await this.userRepository.updateUser(userId, {
            name: updateData.name,
            email: updateData.email,
            password_hash: hashedPassword
        });
        
        return {
            email: updatedUser.email,
            name: updatedUser.name
        };
    }

    async searchUsers(email?: string, name?: string): Promise<UserDto[]> {
        const users = await this.userRepository.searchUsers(email, name);
        return users.map(user => ({
            email: user.email,
            name: user.name
        }));
    }
}

