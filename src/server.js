import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { errors } from 'celebrate';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';


import { swaggerOptions } from './utils/swagger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { router } from './routes/router.js';

const app = express();


const PORT = process.env.PORT ?? 5000;
const isProduction = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');

// 1. ДОВІРА ПРОКСІ
app.set('trust proxy', 1);

// 2. БЕЗПЕКА (Helmet з CSP для Swagger та Cloudinary)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "res.cloudinary.com", "data:"],
        "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      },
    },
  })
);

// 3. CORS
const allowedOrigins = [
  process.env.FRONTEND_DOMAIN,
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 4. ПАРСЕРИ ТА ЛОГЕР
app.use(logger);
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// 5. СТАТИЧНІ ФАЙЛИ
app.use('/public', express.static(publicPath));

// 6. SWAGGER
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: '/public/swagger.css',
    customSiteTitle: 'Travellers API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
    },
  })
);

// 7. RATE LIMITER (Жорсткий у проді, лояльний у деві)
app.use(generalLimiter);

// 8. РОУТИ (префікс /api для всього API)
app.use('/api', router);


// 9. ОБРОБКА ПОМИЛОК
app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server ready in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📖 Swagger: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('💥 Critical error during startup:', error);
    process.exit(1);
  }
};

startServer();
