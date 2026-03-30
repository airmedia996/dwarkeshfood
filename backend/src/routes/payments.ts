import express from 'express';
import {
  createStripeIntent,
  confirmStripePayment,
  initiateModiPayment,
  momoWebhookCallback,
  confirmCashPayment,
  getPayment
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Stripe
router.post('/stripe/intent', authenticateToken, createStripeIntent);
router.post('/stripe/confirm', authenticateToken, confirmStripePayment);

// Momo
router.post('/momo/request', authenticateToken, initiateModiPayment);
router.post('/momo/callback', momoWebhookCallback);

// Cash
router.post('/cash/confirm', authenticateToken, confirmCashPayment);

// Generic
router.get('/:id', authenticateToken, getPayment);

export default router;
