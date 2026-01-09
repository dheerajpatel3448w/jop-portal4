import { Router } from "express";
import { isauth } from "../middlewares/auth.middleware.js";
import { checkout, paymentVerification } from "../controller/payment.controller.js";

const router:Router = Router();
router.route("/checkout").post(isauth,checkout)
router.route("/verify").post(isauth,paymentVerification);

export default router