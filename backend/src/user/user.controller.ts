import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * Controller for handling user-related HTTP requests
 * Provides endpoints for user registration and information retrieval
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get all users in the system
   * GET /users
   */
  @Get()
  findAll() {
    return this.userService.getAllUsers();
  }

  /**
   * Register a new user with RFID tag
   * POST /users/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    // Check if the user with this UID already exists
    const existingUser = await this.userService.findByUid(createUserDto.uid);
    if (existingUser) {
      throw new BadRequestException(`User with RFID tag ${createUserDto.uid} already exists`);
    }
    
    return this.userService.createUser(createUserDto);
  }

  /**
   * Get user information by RFID UID
   * GET /users/rfid/:uid
   */
  @Get('rfid/:uid')
  findByRfid(@Param('uid') uid: string) {
    if (!uid) {
      throw new BadRequestException('RFID UID is required');
    }
    return this.userService.findByUid(uid);
  }

  /**
   * Get user information by ID
   * GET /users/:id
   * Note: This must be the last route to avoid catching other routes
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Validate that ID is a number before passing to service
    const userId = Number(id);
    if (isNaN(userId)) {
      throw new BadRequestException('User ID must be a number');
    }
    return this.userService.findUserById(userId);
  }
}
