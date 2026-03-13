import express from 'express';
import { protect } from '../middleware/AuthMiddleware.js';
import { getProfile, login, register } from '../Controller/AuthController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login
);
router.get('/profile', protect, getProfile);

export default router;