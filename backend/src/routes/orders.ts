import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  rateOrder,
  trackOrder
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getOrders);
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id/cancel', authenticateToken, cancelOrder);
router.put('/:id/rating', authenticateToken, rateOrder);
router.get('/:id/tracking', trackOrder);

export default router;
