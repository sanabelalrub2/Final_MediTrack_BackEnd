 

  
import { Router } from "express";
import * as controller from "./auth.controller.js";
import { auth } from "../../middleware/auth.middleware.js";
  

const router = Router();

router.post('/register', controller.register);
router.post('/confirmEmail/:token', controller.confirmEmail);  
router.post('/login', controller.login);
 
router.post('/sendCode',  controller.sendCode); 
router.post('/verifyCode',  controller.verifyCode);
router.post('/resetPassword',  controller.resetPassword);

export default router;
