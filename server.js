import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import userRouter from './routes/userRouter.js';
import { fileURLToPath } from 'url';
import ConnectDB from './config/db.js';


const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const mongodbUrl = process.env.MONGODB_URI;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine","ejs");
app.set("views", path.join(__dirname, 'views'));

ConnectDB(mongodbUrl);

app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use('/', userRouter);


app.listen(PORT , () => {
  console.log(`http://localhost:${PORT}`);
})