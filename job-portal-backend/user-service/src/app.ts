import type { Express } from "express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/user.route.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app:Express = express();

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use('/user',router);

export default app;