import { Router } from "express";
import * as controller from "./medication.controller.js";
import { auth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/getAllMedications", auth, controller.getAllMedications);
router.get("/getMedicationById/:id", auth, controller.getMedicationById);
router.post("/createMedication", auth, controller.createMedication);
router.put("/updateMedication/:id", auth, controller.updateMedication);
router.delete("/deleteMedication/:id", auth, controller.deleteMedication);
router.get("/cart", auth, controller.getCartMedications);

export default router;
