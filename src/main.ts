import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'modules/app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não esperadas
      forbidNonWhitelisted: true, // lança erro se vier campos não definidos no DTO
      transform: true, // transforma o body em instância da classe DTO
    }),
  );
  app.useLogger(app.get(Logger));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
