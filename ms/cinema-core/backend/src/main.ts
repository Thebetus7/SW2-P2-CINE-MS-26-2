import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './presentation/graphql/schema';
import { HealthController } from './presentation/controllers/Health.controller';
import * as express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const expressApp = app.getHttpAdapter().getInstance();
  const healthController = new HealthController();

  // Endpoint REST de Salud
  expressApp.get('/health', (_req: any, res: any) => {
    res.json(healthController.checkHealth());
  });

  // Apollo Server GraphQL
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  expressApp.use(
    '/graphql',
    express.json(),
    expressMiddleware(server)
  );

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚀 Cinema Core Backend ejecutándose en: http://localhost:${port}`);
  console.log(`📊 Endpoint GraphQL Apollo disponible en: http://localhost:${port}/graphql`);
  console.log(`💚 Endpoint de salud REST disponible en: http://localhost:${port}/health`);
}

bootstrap().catch((err) => {
  console.error('❌ Error iniciando Cinema Core Backend:', err);
  process.exit(1);
});
