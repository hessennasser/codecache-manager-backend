import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  UploadedFiles,
  UseInterceptors,
  Request,
  Put,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ApiTags, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { UsersService } from "src/users/users.service";

/**
 * AuthController
 *
 * This controller handles user authentication operations including registration, login, and logout.
 *
 * @class
 */
@ApiTags("Authentication")
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  /**
   * Register a new user using FormData
   *
   * @route POST /auth/register
   * @param {FormData} formData - The user data for registration sent as FormData
   * @returns {Promise<any>} The registered user data
   *
   * @apiresponse {201} User successfully registered
   * @apiresponse {400} Bad request - Validation error or user already exists
   */
  @Post("register")
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @UseInterceptors(AnyFilesInterceptor())
  async register(@Body() formData: any) {
    // Convert FormData to the DTO structure
    const createUserDto = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      companyName: formData.companyName,
      companyWebsite: formData.companyWebsite,
      position: formData.position,
      username: formData.username,
    };

    return this.authService.register(createUserDto);
  }

  /**
   * Authenticate a user using FormData and return a JWT token
   *
   * @route POST /auth/login
   * @param {LoginDto} formData - The login credentials sent as FormData
   * @returns {Promise<{ access_token: string }>} JWT access token
   *
   * @apiresponse {200} User successfully logged in
   * @apiresponse {401} Unauthorized - Invalid credentials
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: "User successfully logged in" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseInterceptors(AnyFilesInterceptor())
  async login(@Body() formData: any) {
    return this.authService.login(formData.email, formData.password);
  }

  /**
   * Update the current user's profile using FormData
   *
   * @route POST /auth/update-profile
   * @param {Request} req - The request object containing the user
   * @param {FormData} formData - The user data for update sent as FormData
   * @returns {Promise<any>} The updated user data
   *
   * @apiresponse {200} User successfully updated
   * @apiresponse {401} Unauthorized
   *
   * @security JWT
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put("update-profile")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: "User successfully updated" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseInterceptors(AnyFilesInterceptor())
  async updateProfile(@Request() req, @Body() formData: any) {
    const userId = req.user.sub;
    return this.userService.update(userId, formData);
  }

  /**
   * Log out the current user
   *
   * @route POST /auth/logout
   * @param {Request} req - The request object containing the user
   * @returns {Promise<any>} Confirmation of logout
   *
   * @apiresponse {200} User successfully logged out
   * @apiresponse {401} Unauthorized
   *
   * @security JWT
   */
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(@Req() req) {
    return this.authService.logout(req.user);
  }
}
