import { Router } from "express";
import { isauth } from "../middlewares/auth.middleware.js";
import { createcompany, createjob, deletecompany, getallactivejob, getallapplication, getallcompany, getcompanydetails, getsinglejob, updateapplication, updatejob } from "../controllers/job.controlller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router:Router = Router();

router.route('/createcompany').post(isauth,upload.single("file"),createcompany);
router.route('/deletecompany/:company_id').delete(isauth,deletecompany);
router.route('/createjob').post(isauth,createjob);
router.route('/updatejob/:job_id').put(isauth,updatejob);
router.route('/getcompanies').get(isauth,getallcompany);
router.route('/getcompanydetails/:id').get(isauth,getcompanydetails);
router.route('/getallactivejob').get(isauth,getallactivejob);
router.route('/getsinglejob/:job_id').get(isauth,getsinglejob);
router.route('/getallapplication/:jobId').get(isauth,getallapplication);
router.route('/updateapplication/:id').put(isauth,updateapplication);

export default router;