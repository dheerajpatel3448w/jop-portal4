import type { Express } from "express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/cloudinary.route.js";
import router2 from "./routes/ai.route.js";
dotenv.config();

const app:Express = express();

app.use(cors());
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({extended:true,limit:'50mb'}));
app.use("/utils",router);
app.use('/ai',router2);


export default app;