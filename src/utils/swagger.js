export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travellers API',
      version: '1.0.0',
      description: 'Документація для проекту Подорожники (REST API)',
    },
   
    servers: [
      {
        url: 'https://traveller-backend-lia1.onrender.com',
        description: 'Production Server (Render)',
      },
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'Авторизація через cookies (accessToken)',
        },
      },
    },
  },

  apis: ['./src/routes/*.js', './src/utils/swaggerSchemas.js'],
};
