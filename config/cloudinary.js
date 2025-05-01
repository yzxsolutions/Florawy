import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const requiredConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };

  const missingConfig = Object.entries(requiredConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingConfig.length > 0) {
    throw new Error(`Missing required Cloudinary configuration: ${missingConfig.join(', ')}`);
  }

  return requiredConfig;
};

// Configure Cloudinary
const configureCloudinary = async () => {
  try {
    const config = validateCloudinaryConfig();
    cloudinary.config(config);
    
    // Test the configuration
    await new Promise((resolve, reject) => {
      cloudinary.api.ping((error, result) => {
        if (error) {
          console.error('Cloudinary configuration test failed:', error);
          reject(new Error('Failed to connect to Cloudinary. Please check your credentials.'));
        } else {
          console.log('Cloudinary configured successfully');
          resolve(cloudinary);
        }
      });
    });

    return cloudinary;
  } catch (error) {
    console.error('Cloudinary configuration error:', error.message);
    throw error;
  }
};

// Initialize Cloudinary and export the configured instance
let cloudinaryInstance = null;

export const getCloudinary = async () => {
  if (!cloudinaryInstance) {
    cloudinaryInstance = await configureCloudinary();
  }
  return cloudinaryInstance;
};

export default getCloudinary; 