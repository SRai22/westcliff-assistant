import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initializeSocketIO } from './sockets/index.js';

const PORT = env.PORT;

const startServer = async () => {
  try {
    // Connect to MongoDB before starting Express
    await connectDB();
    
    // Create HTTP server from Express app
    const httpServer = createServer(app);
    
    // Initialize Socket.io
    const io = initializeSocketIO(httpServer);
    
    // Store io instance on app for access in routes
    app.set('io', io);
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend listening on http://0.0.0.0:${PORT}`);
      console.log(`Socket.io initialized and ready for connections`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
