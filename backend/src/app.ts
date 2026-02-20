import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { getConnectionStatus } from './config/db.js';
import { validate } from './middleware/validate.js';
import { createTicketSchema } from './validation/schemas.js';

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

// Test route to demonstrate validation (will be replaced with actual routes)
app.post('/api/test-validation', validate(createTicketSchema, 'body'), (req, res) => {
  res.json({ 
    message: 'Validation passed!',
    data: req.body 
  });
});

export default app;
