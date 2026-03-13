import express from 'express';
import {
  markAttendance,
  getUserAttendance,
  getAllAttendance,
  getAttendanceSummary
} from "../Controller/AttendanveController.js";

import { protect, admin } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.use(protect);

router.post('/mark', markAttendance);
router.get('/my-attendance', getUserAttendance);

router.get('/summary', getAttendanceSummary); 
router.get('/summary/:userId', admin, getAttendanceSummary);
router.get('/all', admin, getAllAttendance);

export default router;