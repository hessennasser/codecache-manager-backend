import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Query, DefaultValuePipe, ParseIntPipe, UseInterceptors, ClassSerializerInterceptor, ValidationPipe, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

/**
 * UsersController
 * 
 * This controller handles CRUD operations for user management.
 * It provides endpoints for creating, reading, updating, and deleting user records.
 * 
 * @class
 */
@ApiTags('Users')
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * Create a new user
   * 
   * @route POST /users
   * @param {CreateUserDto} createUserDto - The user data to create
   * @returns {Promise<UserResponseDto>} The created user
   * 
   * @apiresponse {201} {UserResponseDto} User created successfully
   * @apiresponse {400} Bad request - Validation error
   */
  @Post()
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return new UserResponseDto(user);
  }

  /**
   * Get all users (paginated)
   * 
   * @route GET /users
   * @param {number} page - The page number (default: 1)
   * @param {number} limit - The number of items per page (default: 10)
   * @returns {Promise<{ data: UserResponseDto[], total: number, page: number, lastPage: number }>} Paginated list of users
   * 
   * @apiresponse {200} {UserResponseDto[]} Return all users
   * @apiresponse {401} Unauthorized
   * @apiresponse {403} Forbidden - Insufficient permissions
   * 
   * @security JWT
   * @security RolesGuard
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all users', type: [UserResponseDto] })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<{ data: UserResponseDto[], total: number, page: number, lastPage: number }> {
    const { data, ...meta } = await this.usersService.findAll({ page, limit });
    return {
      data: data.map(user => new UserResponseDto(user)),
      ...meta,
    };
  }

  /**
   * Get a specific user by ID
   * 
   * @route GET /users/:id
   * @param {string} id - The user's unique identifier
   * @returns {Promise<UserResponseDto>} The requested user
   * 
   * @apiresponse {200} {UserResponseDto} Return the user
   * @apiresponse {401} Unauthorized
   * @apiresponse {404} User not found
   * 
   * @security JWT
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)

  @ApiResponse({ status: 200, description: 'Return the user', type: UserResponseDto })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }

  /**
   * Update a user's information
   * 
   * @route PATCH /users/:id
   * @param {string} id - The user's unique identifier
   * @param {UpdateUserDto} updateUserDto - The user data to update
   * @returns {Promise<UserResponseDto>} The updated user
   * 
   * @apiresponse {200} {UserResponseDto} User updated successfully
   * @apiresponse {401} Unauthorized
   * @apiresponse {404} User not found
   * 
   * @security JWT
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)

  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  /**
   * Delete a user
   * 
   * @route DELETE /users/:id
   * @param {string} id - The user's unique identifier
   * @returns {Promise<void>}
   * 
   * @apiresponse {200} User deleted successfully
   * @apiresponse {401} Unauthorized
   * @apiresponse {403} Forbidden - Insufficient permissions
   * @apiresponse {404} User not found
   * 
   * @security JWT
   * @security RolesGuard
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')

  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}