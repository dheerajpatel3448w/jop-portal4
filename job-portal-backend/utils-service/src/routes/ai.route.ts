import { Router } from "express";
import { careerguidance, resumeanalyser } from "../controllers/ai.controller.js";

const router2:Router = Router();

router2.route('/career').post(careerguidance);
router2.route('/resume-analyser').post(resumeanalyser);

export default router2;