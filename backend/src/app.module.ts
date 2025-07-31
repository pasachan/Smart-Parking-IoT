import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from './booking/booking.module';
import { UserModule } from './user/user.module';
import { SlotModule } from './slot/slot.module';
import { User } from './user/user.entity';
import { Booking } from './booking/booking.entity';
import { Slot } from './slot/slot.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: process.env.MYSQL_SERVER_PASSWORD || 'Pass@1895',
      database: process.env.MYSQL_SERVER_DATABASE || 'parking',
      entities: [User, Booking, Slot], // Add all your entities here
      synchronize: true, 
    }), 
    UserModule,
    BookingsModule, 
    SlotModule
  ],
  controllers: [], // Feature controllers are registered in their respective modules
  providers: [], // Feature services are registered in their respective modules
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // No middleware, but required for interface
  }
}
