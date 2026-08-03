import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('BLOGGER API')
      .addBearerAuth()
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'access_token', // Имя схемы для access токена
      )
      .addCookieAuth(
        'refreshToken', // Имя cookie
        {
          type: 'apiKey',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'cookie',
          name: 'refreshToken',
        },
        'refresh_token', // Имя схемы для refresh токена
      )
      .addBasicAuth(
        {
          type: 'http',
          scheme: 'basic',
          description: 'Basic authentication for admin endpoints',
        },
        'basic_auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'Blogger Swagger',
    });
  }
}
