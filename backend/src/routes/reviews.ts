import express from 'express';
import {
  createReview,
  getOrderReview,
  updateReview,
  getMenuItemReviews,
  getRecentReviews,
  getOverallRating
} from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/recent', getRecentReviews);
router.get('/overall', getOverallRating);
router.get('/menu-item/:menuItemId', getMenuItemReviews);
router.get('/order/:orderId', getOrderReview);
router.post('/', authenticateToken, createReview);
router.put('/:id', authenticateToken, updateReview);

export default router;