import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from 'common/filters/global-exception.filter';
import { ResponseInterceptor } from 'common/interceptors/response.interceptor';
import { AppModule } from 'modules/app.module';
import { Logger } from 'nestjs-pino';

// main.ts
import * as crypto from 'crypto';

if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = crypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Response Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não esperadas
      forbidNonWhitelisted: true, // lança erro se vier campos não definidos no DTO
      transform: true, // transforma o body em instância da classe DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Prefix
  app.setGlobalPrefix('api/');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Wallet AI API')
    .setDescription('API para gerenciamento financeiro pessoal')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Firebase JWT Token',
      },
      'firebase-auth',
    )
    .addTag('Users', 'Operações relacionadas a usuários')
    .addTag('Expenses', 'Operações relacionadas a despesas')
    .addTag('Incomes', 'Operações relacionadas a receitas')
    .addTag('Categories', 'Operações relacionadas a categorias')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useLogger(app.get(Logger));

  await app.listen(process.env.PORT ?? 3001);

  const logger = app.get(Logger);
  logger.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3001}`,
  );
  logger.log(
    `Swagger docs available at: http://localhost:${process.env.PORT ?? 3001}/api/docs`,
  );
}
bootstrap();
