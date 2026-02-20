import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { getConnectionStatus } from './config/db.js';

const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({ 
    status: 'ok', 
    db: dbStatus 
  });
});

export default app;
