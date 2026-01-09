import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "./configs/db.js";
import { connnectkafka } from "./service/producer.service.js";




connnectkafka();
connectDb().then(()=>{
    app.listen(process.env.PORT, () => {
  console.log("job service is running on port " + process.env.PORT);
});
}).catch((error)=>{
    console.error("Failed to connect to the database:", error);
});