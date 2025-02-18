import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function start() {
  if (!process.env.CONFIG_PATH) {
    console.error('CONFIG_PATH is not set');
    process.exit(1);
  }
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('server.port') ?? 3000;
  const HOST = configService.get<string>('server.host') ?? 'localhost';
  console.log(`Running server on http://${HOST}:${PORT}`);
  await app.listen(PORT, HOST);
}
start();
