import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { jwtConstants } from "./constants";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { JwtService } from "./strategies/jwt.strategy";
import { JwtUserUtil } from "./jwt-user.util";
import { UsersService } from "src/users/users.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60m" },
    }),
  ],
  providers: [AuthService, UsersService, JwtService, JwtUserUtil],
  controllers: [AuthController],
  exports: [JwtService, JwtUserUtil],
})
export class AuthModule {}
