import dotenv from 'dotenv';
dotenv.config();
import Contacts from '../models/contactSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import nodemailer from 'nodemailer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check Cloudinary configuration
if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary configuration is incomplete. Please check your .env file.');
  process.exit(1); // Exit with error if config is missing
}

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, SendGrid, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app-specific password
  }
});

// Configure multer for memory storage (temporary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Images and PDFs only!'));
  }
}).fields([
  { name: 'front_id', maxCount: 1 },
  { name: 'back_id', maxCount: 1 }
]);

// Function to send confirmation email
const sendConfirmationEmail = async (to, firstName) => {
  const logoPath = path.join(process.cwd(), 'public', 'images', 'FLORAWY-15.svg');
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Welcome to Florawy - Form Submission Successful!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          .header { background-color: #2E8B57; padding: 20px; text-align: center; }
          .header img { max-width: 150px; height: auto; }
          .content { padding: 30px; color: #333333; }
          .content h1 { color: #2E8B57; font-size: 24px; margin-bottom: 20px; }
          .content p { font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
          .button { display: inline-block; padding: 12px 25px; background-color: #2E8B57; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #777777; }
          .footer a { color: #2E8B57; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="cid:logo" alt="Florawy Logo" />
          </div>
          <div class="content">
            <h1>Hello ${firstName},</h1>
            <p>Thank you for reaching out to Florawy! Your contact form has been successfully submitted. We’re thrilled to have you with us and will get back to you soon with more details.</p>
            <p>In the meantime, feel free to explore our stunning floral collections or get in touch if you have any questions!</p>
            <a href="https://www.florawy.com" class="button">Shop Now</a>
          </div>
          <div class="footer">
            <p>&copy; 2025 Florawy. All rights reserved.</p>
            <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [{
      filename: 'FLORAWY-15.svg',
      path: logoPath,
      cid: 'logo' // Referenced in the HTML as "cid:logo"
    }]
  };

  await transporter.sendMail(mailOptions);
};

export const submitContactForm = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }

      const {
        first_name,
        last_name,
        email,
        'wtsp-number': whatsappNumber,
        address,
        'work-position': workPosition,
        nfcCheckbox,
        termsCheckbox
      } = req.body;

      if (!req.files || !req.files['front_id']) {
        return res.status(400).json({
          success: false,
          message: 'Front ID is required'
        });
      }

      // Helper function to upload to Cloudinary
      const uploadToCloudinary = (buffer) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'florawy_ids',
              resource_type: 'auto',
              transformation: [{ width: 500, height: 500, crop: 'limit' }]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });
      };

      // Upload front_id to Cloudinary
      const frontIdResult = await uploadToCloudinary(req.files['front_id'][0].buffer);

      // Upload back_id to Cloudinary if provided
      let backIdResult = null;
      if (req.files['back_id']) {
        backIdResult = await uploadToCloudinary(req.files['back_id'][0].buffer);
      }

      const contact = new Contacts({
        firstName: first_name,
        lastName: last_name,
        email,
        whatsappNumber,
        address,
        workPosition,
        frontId: frontIdResult.secure_url,
        backId: backIdResult ? backIdResult.secure_url : null,
        wantsNfcCard: nfcCheckbox === true || nfcCheckbox === 'true',
        acceptedTerms: termsCheckbox === true || termsCheckbox === 'true'
      });

      await contact.save();

      // Send confirmation email to the user
      await sendConfirmationEmail(email, first_name);

      res.status(201).json({
        success: true,
        message: 'Form submitted successfully'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};