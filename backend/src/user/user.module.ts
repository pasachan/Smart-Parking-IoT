import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Register User entity with TypeORM
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Export UserService to use it in other modules
})
export class UserModule {}
