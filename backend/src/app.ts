import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { getConnectionStatus } from './config/db.js';
import { sessionMiddleware } from './config/session.js';
import { validate } from './middleware/validate.js';
import { createTicketSchema } from './validation/schemas.js';
import authRouter from './routes/auth.js';
import ticketsRouter from './routes/tickets.js';
import { requireAuth, requireStaff } from './middleware/auth.js';

const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// Session middleware (must come after express.json())
app.use(sessionMiddleware);

app.get('/health', (_req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({ 
    status: 'ok', 
    db: dbStatus 
  });
});

// Auth routes
app.use('/auth', authRouter);

// Ticket routes
app.use('/tickets', ticketsRouter);

// Test routes for RBAC middleware
app.get('/api/test-auth', requireAuth, (req, res) => {
  res.json({ 
    message: 'Authentication successful',
    user: {
      id: req.user!._id,
      email: req.user!.email,
      name: req.user!.name,
      role: req.user!.role
    }
  });
});

app.get('/api/test-staff', requireStaff, (req, res) => {
  res.json({ 
    message: 'Staff access granted',
    user: {
      id: req.user!._id,
      email: req.user!.email,
      name: req.user!.name,
      role: req.user!.role
    }
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
