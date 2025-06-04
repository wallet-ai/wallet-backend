import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não esperadas
      forbidNonWhitelisted: true, // lança erro se vier campos não definidos no DTO
      transform: true, // transforma o body em instância da classe DTO
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
