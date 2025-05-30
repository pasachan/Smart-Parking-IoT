// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * Service for handling user-related operations
 * Manages user creation, retrieval, and RFID association
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user with RFID tag
   * @param createUserDto User data including name, email and RFID UID
   * @returns Newly created user
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, uid } = createUserDto;
    const user = this.userRepository.create({ name, email, uid });
    return this.userRepository.save(user);
  }

  // Old method kept for compatibility - redirects to the new one
  async createUserWithParams(name: string, email: string, uid: string): Promise<User> {
    return this.createUser({ name, email, uid } as CreateUserDto);
  }

  /**
   * Find a user by their RFID UID
   * @param uid RFID UID
   * @returns User if found, undefined otherwise
   */
  async findByUid(uid: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ 
      where: { uid },
      relations: ['bookings'] 
    });
    
    return user;
  }

  /**
   * Find a user by their ID
   * @param id User ID
   * @returns User if found, undefined otherwise
   */
  async findById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ 
      where: { id },
      relations: ['bookings'] 
    });
  }

  /**
   * Get all users in the system
   * @returns Array of all users
   */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({ relations: ['bookings'] });
  }

  /**
   * Find user by ID with full error handling
   * @param id User ID
   * @returns User if found
   * @throws NotFoundException if user doesn't exist
   */
  async findUserById(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
