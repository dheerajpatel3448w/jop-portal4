import { Router } from "express";
import { addskills, applyforjob, getallapplication, getprofile, logout, myprofile, skilldelete, updateprofilepic, updateresume, updateuserprofile } from "../controllers/user.controller.js";
import { isauth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router:Router=Router();


router.route('/profile').get(isauth,myprofile);
router.route('/getprofile/:userId').get(isauth,getprofile);
router.route('/updateuser').put(isauth,updateuserprofile);
router.route('/updateprofilepic').put(isauth,upload.single("file"),updateprofilepic);
router.route('/updateresume').put(isauth,upload.single("file"),updateresume);
router.route('/addskill').post(isauth,addskills);
router.route('/deleteskill').put(isauth,skilldelete);
router.route('/applyjob').post(isauth,applyforjob);
router.route('/getallapplication').get(isauth,getallapplication);
router.route('/logout').get(isauth,logout)


export default router;