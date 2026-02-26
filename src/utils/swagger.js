<<<<<<< HEAD
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

=======
>>>>>>> 8b9aa3f (fix all routs)
export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travellers API',
      version: '1.0.0',
<<<<<<< HEAD
      description: 'API для платформи обміну історіями мандрівників',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Головний сервер',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.js'),
  ],
=======
      description: 'Документація для проекту Подорожники',
    },
    servers: [{ url: 'http://localhost:5000' }],
  },
  apis: ['./src/routes/*.js', './src/utils/swaggerSchemas.js'],
>>>>>>> 8b9aa3f (fix all routs)
};
