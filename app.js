import cookieParser from 'cookie-parser';
import express from 'express'
import cors from 'cors';
import morgan from 'morgan';

import {config} from 'dotenv';
config();


import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
}));



app.use(cookieParser());
app.use(morgan('dev'))



// routes of 3 modules

app.use('/api/v1/user',userRoutes);
app.use('/api/v1/courses',courseRoutes);
app.use('/api/v1/payments',paymentRoutes);

app.all('*',(req,res)=>{
    res.status(404).send('OOPS! 404 page not found');
});

app.use(errorMiddleware);

export default app;