import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';

const userRouter = express.Router();


userRouter.get('/' , (req,res) => {
  res.render('welcome');
})

userRouter.get('/home', (req,res) =>{
  res.render('home');
})


userRouter.post('/submit', submitContactForm);


export default userRouter;