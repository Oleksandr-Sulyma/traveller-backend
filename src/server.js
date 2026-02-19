import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { errors } from 'celebrate';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(logger);
app.use(express.json({ limit: '5mb' }));
app.use(cors({ methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(helmet());
app.use(cookieParser());

app.use(authRoutes);
app.use(userRoutes);
app.use(storyRoutes);

app.use(notFoundHandler);

app.use(errors());

app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});