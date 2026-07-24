import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { QueryNormalizationPipe } from './common/pipes/query-normalization.pipe';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global prefix
  const configuredPrefix = config.get<string>('API_PREFIX') || 'api';
  const apiPrefix =
    configuredPrefix
      .replace(/^\/+|\/+$/g, '')
      .replace(/\/v\d+$/i, '') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS
  app.enableCors({
    origin: config.get('SOCKET_IO_CORS_ORIGIN') || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Correlation-ID'],
  });

  // Global pipes
  app.useGlobalPipes(
    new QueryNormalizationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
    new ZodValidationPipe(),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DiamondFlow API')
    .setDescription('ERP+MES Unified Platform for Diamond & Jewelry Manufacturing')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'Idempotency-Key', in: 'header' }, 'Idempotency-Key')
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 DiamondFlow API running on http://localhost:${port}`);
  console.log(`📚 API Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
