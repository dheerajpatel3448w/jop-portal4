import app from "./app.js";
import dotenv from "dotenv";
import { sendmailtoconsumer } from "./service/consumer.service.js";

dotenv.config();
sendmailtoconsumer();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Utils Service is running on port ${PORT} 🚀`);
});