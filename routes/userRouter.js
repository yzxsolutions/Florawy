import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';

const userRouter = express.Router();

// Welcome page route
userRouter.get('/', (req, res) => {
  try {
    res.render('welcome');
  } catch (error) {
    console.error('Error rendering welcome page:', error);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});

// Home page route
userRouter.get('/home', (req, res) => {
  try {
    res.render('home');
  } catch (error) {
    console.error('Error rendering home page:', error);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});

// Contact form submission route
userRouter.post('/submit', submitContactForm);

export default userRouter;