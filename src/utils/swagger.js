export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travellers API',
      version: '1.0.0',
      description: 'Документація для проекту Подорожники',
    },
    servers: [{ url: 'http://localhost:5000' }],
  },
  apis: ['./src/routes/*.js', './src/utils/swaggerSchemas.js'],
};
