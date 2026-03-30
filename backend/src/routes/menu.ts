import express from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories
} from '../controllers/menuController.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/categories', getCategories);
router.get('/:id', getMenuItem);
router.post('/', authenticateToken, adminOnly, createMenuItem);
router.put('/:id', authenticateToken, adminOnly, updateMenuItem);
router.delete('/:id', authenticateToken, adminOnly, deleteMenuItem);

export default router;
