import { Router } from "express";
import { upload } from "../controllers/cloudinary.controller.js";


const router:Router = Router();
router.route("/upload").post(upload);

export default router;