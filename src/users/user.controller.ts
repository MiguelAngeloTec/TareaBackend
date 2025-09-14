/* eslint-disable prettier/prettier */

import { Body, Controller, Patch, Post, Put, Req, UseGuards } from "@nestjs/common";
import { UserDto, UserService } from "./user.service";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import * as authenticatedRequest from "src/common/interfaces/authenticated-request";

export class CreateUserDto{
    @ApiProperty({example:"user@example.com", description:"Email del usuario"})
    email: string;
    @ApiProperty({example:"Usuario Ejemplo", description:"Nombre del usuario"})
    name: string;
    @ApiProperty({example:"password123", description:"Contraseña del usuario"})
    password: string;
}

export class UpdateUserDto {
  @ApiProperty({ 
    description: 'Nombre del usuario', 
    example: 'Juan Pérez Actualizado',
    required: false 
  })
  name?: string;

  @ApiProperty({ 
    description: 'Email del usuario', 
    example: 'nuevo@email.com',
    required: false 
  })
  email?: string;

  @ApiProperty({ 
    description: 'Nueva contraseña', 
    example: 'nuevaPassword123',
    required: false 
  })
  password?: string;
}

@ApiTags("Endpoints de Usuarios")
@Controller("users")
export class UserController{
    constructor(private readonly userService: UserService) {}

    @Post()
    @ApiResponse({status: 201, description: "Usuario creado exitosamente"})
    @ApiResponse({status: 400, description: "Error interno del servidor"})
    async registerUser(@Body() userDto: CreateUserDto): Promise<UserDto|void> {
        return this.userService.registerUser(userDto.email, userDto.name, userDto.password);
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Actualizar perfil de usuario' })
    @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async updateUser(
        @Body() updateData: UpdateUserDto,
        @Req() req: authenticatedRequest.AuthenticatedRequest
    ): Promise<UserDto> {
        return this.userService.updateUser(parseInt(req.user.userId), updateData);
    }

}
