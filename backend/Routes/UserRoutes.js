import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateLeaveBalance,
  createAdmin
} from "../Controller/UserController.js"
import { protect, admin } from "../middleware/AuthMiddleware.js"

const router = express.Router();

router.post('/create-admin', createAdmin);
router.use(protect, admin);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/leave-balance', updateLeaveBalance);

export default router;