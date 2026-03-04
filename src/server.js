import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import path from 'path';
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
const isProduction = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "https:", "data:"],
      },
    },
  })
);

app.use(cors({
  origin: [
    process.env.FRONTEND_DOMAIN,
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(logger);
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use('/public', express.static(publicPath));

app.use(generalLimiter);

// --- ROUTES ---
// Документація тепер працює окремо через Redocly CLI
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/stories', storyRouter);
app.use('/categories', categoryRouter);

// --- ERROR HANDLING ---
app.use(notFoundHandler);

// Обробка помилок валідації Celebrate
app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    const errorDetail = err.details.get('body') || err.details.get('query') || err.details.get('params');
    return res.status(400).json({
      status: 400,
      message: errorDetail.details[0].message,
    });
  }
  next(err);
});

// Обробка помилок Multer (розмір файлів)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    const limit = req.url.includes('avatar') ? '500KB' : '2MB';
    return res.status(400).json({
      status: 400,
      message: `Файл занадто великий. Максимальний розмір: ${limit}`,
    });
  }
  next(err);
});

app.use(errorHandler);

// --- SERVER START ---
const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server ready [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
    });
  } catch (error) {
    console.error('💥 Startup error:', error);
    process.exit(1);
  }
};

startServer();
