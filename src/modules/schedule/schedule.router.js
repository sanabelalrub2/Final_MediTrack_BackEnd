



 

import { Router } from "express";
import * as controller from "./schedule.controller.js";
import { auth } from "../../middleware/auth.middleware.js";

const router = Router();

 
router.get("/getAllSchedules", auth, controller.getAllSchedules);
router.get("/getScheduleById/:id", auth, controller.getScheduleById);
router.post("/createSchedule", auth, controller.createSchedule);
router.put("/updateSchedule/:id", auth, controller.updateSchedule);
router.patch("/updateScheduleTime/:id", auth, controller.updateScheduleTime);

router.delete("/deleteSchedule/:id", auth, controller.deleteSchedule);
router.get("/getTodaySchedules", auth, controller.getTodaySchedules);

export default router;


 