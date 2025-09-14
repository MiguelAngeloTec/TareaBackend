/* eslint-disable prettier/prettier */

import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserRepository,UserService],
  exports: [UserService]
})
export class UserModule {}
