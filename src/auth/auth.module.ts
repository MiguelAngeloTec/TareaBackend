/* eslint-disable prettier/prettier */

import { Global, Module } from "@nestjs/common";
import { UserModule } from "src/users/user.module";
import { AuthController } from "./auth.controller";
import { TokenService } from "./tokens.service";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
    imports: [
        UserModule,
        JwtModule.register({
            secret: "supersecret", // Usa variables de entorno en producción
            signOptions: { expiresIn: '1m' }
        })
    ],
    controllers: [AuthController],
    providers: [TokenService],
    exports: [TokenService] // ✅ Exportar TokenService
})
export class AuthModule {}