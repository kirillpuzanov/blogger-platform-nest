import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { settings } from './settings';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('BLOGGER API')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(settings.APP_GLOBAL_PREFIX, app, document, {
    customSiteTitle: 'Blogger Swagger',
  });
}

// todo - в свагере не генирится пример респонса ??
