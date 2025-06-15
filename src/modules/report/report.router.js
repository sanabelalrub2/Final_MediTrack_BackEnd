import { Router } from "express";
import * as controller from "./report.controller.js";
import { auth } from "../../middleware/auth.middleware.js";   

const router = Router();

router.post("/generateReport", auth, controller.generateAdherenceReport);
router.get("/getReportById/:id", auth, controller.getReportById);
router.get("/getAllReports", auth, controller.getAllReports);

export default router;
