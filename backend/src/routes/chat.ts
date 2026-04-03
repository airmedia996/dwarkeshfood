import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import * as chatService from '../services/chatService.js';

const router = Router();

router.use(authenticateToken);

const requireAdmin = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user!.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }
  next();
};

// User routes
router.post('/conversation', async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await chatService.createConversation(req.user!.id);
    res.json(conversation);
  } catch (error) {
    throw error;
  }
});

router.get('/conversation', async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await chatService.getUserConversation(req.user!.id);
    res.json(conversation);
  } catch (error) {
    throw error;
  }
});

router.get('/conversation/:id', async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await chatService.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    throw error;
  }
});

router.post('/conversation/:id/message', async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Message content required' });
    }
    const message = await chatService.sendMessage(
      req.params.id,
      req.user!.id,
      req.user!.role === 'admin' ? 'admin' : 'user',
      content
    );
    res.json(message);
  } catch (error) {
    throw error;
  }
});

router.post('/conversation/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const { messageIds } = req.body;
    await chatService.markAsRead(messageIds);
    res.json({ success: true });
  } catch (error) {
    throw error;
  }
});

// Admin routes
router.get('/admin/conversations', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await chatService.getConversations(req.user!.id);
    res.json(conversations);
  } catch (error) {
    throw error;
  }
});

router.post('/admin/conversation/:id/close', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await chatService.closeConversation(req.params.id, req.user!.id);
    res.json(conversation);
  } catch (error) {
    throw error;
  }
});

export default router;