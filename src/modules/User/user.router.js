import { Router } from "express";
import * as userController from "./user.controller.js";
import { auth } from "../../middleware/auth.middleware.js";

const router = Router();

 
router.get('/getCurrentUser/:id', auth, userController.getCurrentUser);
router.post('/emergency-contact', auth, userController.createEmergencyContact);
router.put('/emergencycontact', auth, userController.updateEmergencyContact);
router.get('/emergency-contact/:contactId', auth, userController.getEmergencyContact);
 router.get('/emergencyAllcontact', auth, userController.getAllEmergencyContacts);

router.delete('/emergency-contact/:contactId', auth, userController.deleteEmergencyContact);
router.put("/updateFcmToken", auth, userController.updateFcmToken);
export default router;
