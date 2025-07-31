import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for localhost and all origins
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3433', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', '*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('parking');
  
  await app.listen(4333);
}
bootstrap();
