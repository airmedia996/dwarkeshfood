import { Router, Response } from 'express';
import { z } from 'zod';
import * as notificationService from '../services/notificationService.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

const markReadSchema = z.object({
  notificationId: z.string()
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user!.id);
    res.json(notifications);
  } catch (error) {
    throw error;
  }
});

router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (error) {
    throw error;
  }
});

router.post('/read/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id, req.user!.id);
    res.json({ success: true });
  } catch (error) {
    throw error;
  }
});

router.post('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true });
  } catch (error) {
    throw error;
  }
});

export default router;