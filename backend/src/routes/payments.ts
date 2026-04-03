import express from 'express';
import {
  createStripeIntent,
  confirmStripePayment,
  initiateMomoPayment,
  checkMomoPaymentStatus,
  momoWebhookCallback,
  confirmCashPayment,
  getPayment,
  getPaymentByOrder
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Stripe
router.post('/stripe/intent', authenticateToken, createStripeIntent);
router.post('/stripe/confirm', authenticateToken, confirmStripePayment);

// Momo
router.post('/momo/request', authenticateToken, initiateMomoPayment);
router.get('/momo/status/:referenceId', authenticateToken, checkMomoPaymentStatus);
router.post('/momo/callback', momoWebhookCallback);

// Cash
router.post('/cash/confirm', authenticateToken, confirmCashPayment);

// Generic
router.get('/:id', authenticateToken, getPayment);
router.get('/order/:orderId', authenticateToken, getPaymentByOrder);

export default router;
