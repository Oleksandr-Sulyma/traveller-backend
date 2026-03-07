import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import SwaggerParser from '@apidevtools/swagger-parser'; // Додали цей імпорт
import { fileURLToPath } from 'url';
import { isCelebrateError } from 'celebrate';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import storyRouter from './routes/storyRouter.js';
import categoryRouter from './routes/categoryRouter.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT ?? 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'https:', 'data:'],
        'script-src': ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'], // Для роботи Swagger UI
      },
    },
  }),
);

app.use(
  cors({
    origin: [
      process.env.FRONTEND_DOMAIN,
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
  }),
);

app.use(logger);
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use('/public', express.static(publicPath));
app.use(generalLimiter);

const startServer = async () => {
  try {
    const swaggerPath = path.join(__dirname, '../docs/openapi/openapi.yaml');
    console.log('⏳ Parsing Swagger documentation...');
    const swaggerDocument = await SwaggerParser.bundle(swaggerPath);


    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use('/auth', authRouter);
    app.use('/users', userRouter);
    app.use('/stories', storyRouter);
    app.use('/categories', categoryRouter);

    app.use((err, req, res, next) => {
      if (isCelebrateError(err)) {
        const errorDetail = err.details.get('body') || err.details.get('query') || err.details.get('params');
        return res.status(400).json({ status: 400, message: errorDetail.details[0].message });
      }
      next(err);
    });

    app.use((err, req, res, next) => {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const limit = req.url.includes('avatar') ? '500KB' : '2MB';
        return res.status(400).json({ status: 400, message: `Файл занадто великий. Максимальний розмір: ${limit}` });
      }
      next(err);
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`🚀 Server ready on port ${PORT}`);
      console.log(`📖 Documentation: http://localhost:${PORT}/api-docs`);
    });

    console.log('⏳ Connecting to MongoDB...');
    await connectMongoDB();

  } catch (error) {
    console.error('❌ Critical error during server start:', error.message);
    process.exit(1);
  }
};

startServer();
