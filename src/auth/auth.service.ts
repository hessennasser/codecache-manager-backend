import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entities/user.entity";
import { JwtService } from "./strategies/jwt.strategy";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; user: User }> {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string; user: User }> {
    try {
      const existingUser = await this.usersService.findByEmail(
        createUserDto.email,
      );
      if (existingUser) {
        throw new ConflictException("Email already exists");
      }

      const newUser = await this.usersService.create(createUserDto);

      const { ...user } = newUser;

      const payload = { sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user,
      };
    } catch (error) {
      this.logger.error("Error in register", error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Something went wrong during registration",
      );
    }
  }

  async logout(user: User) {
    // Implement logout logic
    return { message: "Logout successful" };
  }

  // AuthService validateUser method
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials, user not founded");
    }

    const isPasswordValid = await this.usersService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials, password");
    }

    return user;
  }

  // UsersService comparePassword method
  async comparePassword(
    attempt: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(attempt, hashedPassword);
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return false;
    }
  }
}
