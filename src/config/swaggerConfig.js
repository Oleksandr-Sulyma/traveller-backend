import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stories API',
      version: '1.0.0',
      description: 'API для публікації та читання цікавих історій',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
      {
        url: 'https://your-app-on-render.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session', // Назва вашої куки (наприклад, session або jwt)
        },
      },
    },
  },
  // Шлях до файлів, де описані @swagger коментарі
  apis: [
    './src/routes/*.js',  
    './src/models/*.js',
  ],
};

export const specs = swaggerJsdoc(options);
