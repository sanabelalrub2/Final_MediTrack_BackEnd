import { Router } from "express";
import * as controller from "./medicationTaken.controller.js";
import { auth } from "../../middleware/auth.middleware.js";  

const router = Router();

router.get("/getAllMedicationTaken", auth, controller.getAllMedicationTaken);
router.post("/createMedicationTaken", auth, controller.createMedicationTaken);
router.put("/updateMedicationTaken/:id", auth, controller.updateMedicationTaken);
router.delete("/deleteMedicationTaken/:id", auth, controller.deleteMedicationTaken);
router.get("/range", auth, controller.getMedicationTakenInRange);

export default router;
