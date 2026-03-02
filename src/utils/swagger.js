import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const swaggerOptions = {
definition: {
openapi: '3.0.0',
info: {
title: 'Travellers API',
version: '1.0.0',
description: 'API для платформи обміну історіями мандрівників (проект Подорожники)',
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
name: 'sessionId',
},
},
},
},
apis: [
 path.join(__dirname, '../routes/*.js'),
  path.join(__dirname, '../models/*.js'),
  path.join(__dirname, './swaggerSchemas.js'),
],
};
