import mongoose from "mongoose";

const ConnectDB = async (url) => {
  // Validate URL format
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid MongoDB connection URL');
  }
  
  // Check if URL starts with mongodb:// or mongodb+srv://
  if (!url.startsWith('mongodb://') && !url.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB connection URL format');
  }
  
  try {
    // Add connection options - removed deprecated options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return mongoose.connection;
    }
    
    // Connect to MongoDB
    const response = await mongoose.connect(url, options);
    console.log("MongoDB connected successfully ==> ", response.connection.host);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    // Handle process termination
    const handleShutdown = async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    };
    
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    
    return response;
  } catch (error) {
    console.error("MongoDB Connection Error ==> ", error.message);
    // Ensure we're throwing a proper error object
    throw new Error(⁠ MongoDB connection failed: ${error.message} ⁠);
  }
}

export default ConnectDB;