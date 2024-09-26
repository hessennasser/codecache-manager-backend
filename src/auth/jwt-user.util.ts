import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";

@Injectable()
export class JwtUserUtil {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async getUserFromToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
