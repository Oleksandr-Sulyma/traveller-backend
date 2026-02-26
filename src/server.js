import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { errors } from 'celebrate';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cookieParser from 'cookie-parser';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { swaggerOptions } from './utils/swagger.js';

const app = express();
const PORT = process.env.PORT ?? 5000;

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(logger);
app.use(helmet());
app.use(cors({
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  origin: process.env.FRONTEND_DOMAIN,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/stories', storyRoutes);
app.use('/categories', categoryRoutes);


app.use(notFoundHandler);
app.use(errors());

app.use((err, req, res, next) => {
  // Multer size limits
  if (err.code === 'LIMIT_FILE_SIZE') {
    const limit = req.url.includes('avatar') ? '500KB' : '2MB';
    return res.status(400).json({
      status: 400,
      message: `Файл занадто великий. Максимальний розмір для цього поля: ${limit}`,
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    status,
    message: err.message || 'Internal Server Error',
  });
});

const start = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

start();
