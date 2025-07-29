import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

// express app
const app = express();

// imports routes
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';   
import { getIpLocation } from './utilities/ip.util.js';

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))

// routes
app.get('/',(req,res)=>{
    res.send('You have to login first');
})

app.get('/api/v1',(req,res)=>{
    res.send('You have to login first');
})

app.get('/api/v1/get-country', async (req,res)=> {
    try {
        console.log('hit')
        const location = await getIpLocation(req);
        res.status(200).json({location});
    } catch (error) {
        res.status(500).json({message: 'Server Error'});
    }
})

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);

export default app;