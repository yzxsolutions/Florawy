import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import userRouter from './routes/userRouter.js';
import { fileURLToPath } from 'url';
import ConnectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const mongodbUrl = process.env.MONGODB_URI;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname,'public')))

// Initialize database connection and start server
const startServer = async () => {
  let server;
  
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await ConnectDB(mongodbUrl);
    console.log('MongoDB connection established');
    
    // Configure middleware
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Configure routes
    app.use('/', userRouter);
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
    
    // Start server
    server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    if (server) {
      server.close();
    }
    process.exit(1);
  }
  
  // Handle process termination
  const shutdown = async () => {
    console.log('Shutting down server...');
    if (server) {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

// Start the server with error handling
startServer().catch(error => {
  console.error('Fatal error during server startup:', error);
  process.exit(1);
});