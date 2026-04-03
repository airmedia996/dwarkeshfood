import express from 'express';
import { register, login, logout, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
