import express from 'express';

// express app
const app = express();

// imports routes
import authRoutes from './routes/auth.routes.js';
import { getIpLocation } from './utilities/ip.util.js';

// middlewares
app.use(express.json());

// routes
app.get('/',(req,res)=>{
    res.send('You have to login first');
})

app.get('/api/v1',(req,res)=>{
    res.send('You have to login first');
})

app.get('/api/v1/get-country', (req,res)=> {
    try {
        res.status(200).json({location: getIpLocation(req)});
    } catch (error) {
        res.status(500).json({message: 'Server Error'});
    }
})

app.use('/api/v1/auth', authRoutes);

export default app;