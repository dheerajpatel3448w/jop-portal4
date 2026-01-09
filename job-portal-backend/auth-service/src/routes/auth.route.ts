import { Router } from "express";
import { forgotPassward, login, register, resetpassword } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router:Router = Router();
router.route("/register").post(upload.single('file'),register);
router.route("/login").post(login);
router.route('/forgotpassword').post(forgotPassward);
router.route('/resetpassword/:token').post(resetpassword);
export default router;