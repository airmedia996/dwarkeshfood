import express from 'express';
import {
  getSettings,
  updateSettings,
  getPublicInfo,
  getDeliveryInfo
} from '../controllers/settingsController.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', getPublicInfo);
router.get('/delivery', getDeliveryInfo);
router.get('/', getSettings);
router.put('/', authenticateToken, adminOnly, updateSettings);

export default router;