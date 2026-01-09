import type { Express } from "express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";


import cookieParser from "cookie-parser";
import router from "./routes/job.route.js";
dotenv.config();

const app:Express = express();

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use('/job',router);


export default app;