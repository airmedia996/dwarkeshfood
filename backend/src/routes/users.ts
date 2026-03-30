import express from 'express';
import { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        profileImage: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    throw error;
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, city, zipCode, profileImage } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        zipCode: zipCode || undefined,
        profileImage: profileImage || undefined
      }
    });

    res.json(user);
  } catch (error) {
    throw error;
  }
});

export default router;
