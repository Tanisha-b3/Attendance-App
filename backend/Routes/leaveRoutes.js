import express from 'express';
import { admin, protect } from '../middleware/AuthMiddleware.js';
import { applyLeave, cancelLeave, getAllLeaves, getLeaveBalance, getUserLeaves, updateLeaveStatus } from '../Controller/LeaveController.js';
const router = express.Router();

router.use(protect);

router.post('/apply', applyLeave);
router.get('/my-leaves', getUserLeaves);
router.get('/balance', getLeaveBalance);
router.delete('/:id', cancelLeave);
router.get('/all', admin, getAllLeaves);
router.put('/:id/status', admin, updateLeaveStatus);

export default router;