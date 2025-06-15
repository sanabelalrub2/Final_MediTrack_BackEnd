import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import { auth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/getAllNotifications", auth, notificationController.getAllNotifications);
router.get("/getNotificationById/:id", auth, notificationController.getNotificationById);
router.post("/createNotification", auth, notificationController.createNotification);
router.put("/updateNotification/:id", auth, notificationController.updateNotification);
router.delete("/deleteNotification/:id", auth, notificationController.deleteNotification);

export default router;
