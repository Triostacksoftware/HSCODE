import mongoose from 'mongoose';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(()=> {
    console.log('Database connected successfully');
    app.listen(process.env.PORT, ()=>{
        console.log(`Server started at ${process.env.DOMAIN}`);
    })
})
.catch((err)=>{
    console.log('Error connecting with Database');
    console.log(err.message);
})