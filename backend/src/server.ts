import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const PORT = env.PORT;

const startServer = async () => {
  try {
    // Connect to MongoDB before starting Express
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend listening on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
