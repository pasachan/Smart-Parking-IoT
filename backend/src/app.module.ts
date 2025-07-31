import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BookingsModule } from './booking/booking.module';
import { UserModule } from './user/user.module';
import { SlotModule } from './slot/slot.module';
import { User } from './user/user.entity';
import { Booking } from './booking/booking.entity';
import { Slot } from './slot/slot.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_SERVER_ADDRESS') || 'localhost',
        port: 3306,
        username: configService.get('MYSQL_SERVER_USERNAME'),
        password: configService.get('MYSQL_SERVER_PASSWORD'),
        database: configService.get('MYSQL_SERVER_DATABASE'),
        entities: [User, Booking, Slot],
        synchronize: true,
      }),
      inject: [ConfigService],
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
