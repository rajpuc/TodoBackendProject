import express from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import {PORT, MAX_JSON_SIZE, REQUEST_LIMIT_TIME, REQUEST_LIMIT_NUMBER, WEB_CACHE, DATABASE} from './app/config/config.js';

import router from './routes/api.js'

const app = express();

//Global middleware
app.use(cors());
app.use(express.json({limit:MAX_JSON_SIZE}));
app.use(hpp());
app.use(helmet());
app.use(cookieParser());

app.use(express.static("public"));
app.set("view engine", 'ejs');

// Rate Limiter
const limiter=rateLimit({windowMs:REQUEST_LIMIT_TIME,max:REQUEST_LIMIT_NUMBER})
app.use(limiter);


// Web Caching
app.set('etag',WEB_CACHE);

//MongoDB Connection
mongoose.connect(DATABASE, {autoIndex : true})
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((error)=>{
        console.log("Database Connection Error");
    });

//Set API Routes
app.use("/api/v1",router);


// Run Your Express Back End Project
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
})