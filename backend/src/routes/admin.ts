import express from 'express';
import {
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  assignDelivery,
  getAnalytics
} from '../controllers/adminController.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticateToken, adminOnly, getDashboard);
router.get('/orders', authenticateToken, adminOnly, getAllOrders);
router.put('/orders/:id/status', authenticateToken, adminOnly, updateOrderStatus);
router.get('/users', authenticateToken, adminOnly, getAllUsers);
router.post('/deliveries/assign', authenticateToken, adminOnly, assignDelivery);
router.get('/analytics', authenticateToken, adminOnly, getAnalytics);

export default router;
