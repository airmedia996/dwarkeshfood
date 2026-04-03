import express from 'express';
import { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

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

// Address management
router.get('/addresses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: { isDefault: 'desc' }
    });
    res.json(addresses);
  } catch (error) {
    throw error;
  }
});

router.post('/addresses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { label, fullAddress, city, zipCode, latitude, longitude, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        label,
        fullAddress,
        city,
        zipCode,
        latitude,
        longitude,
        isDefault: isDefault || false
      }
    });

    res.status(201).json(address);
  } catch (error) {
    throw error;
  }
});

router.put('/addresses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { label, fullAddress, city, zipCode, latitude, longitude, isDefault } = req.body;

    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingAddress) {
      throw new AppError('Address not found', 404);
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label: label || undefined,
        fullAddress: fullAddress || undefined,
        city: city || undefined,
        zipCode: zipCode || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined
      }
    });

    res.json(address);
  } catch (error) {
    throw error;
  }
});

router.delete('/addresses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: req.user!.id }
    });

    if (!existingAddress) {
      throw new AppError('Address not found', 404);
    }

    await prisma.address.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    throw error;
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.default.compare(currentPassword, user.password);

    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.default.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    throw error;
  }
});

// Get order stats
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const totalOrders = await prisma.order.count({
      where: { customerId: req.user!.id }
    });

    const completedOrders = await prisma.order.count({
      where: { customerId: req.user!.id, status: 'delivered' }
    });

    const totalSpent = await prisma.order.aggregate({
      where: { customerId: req.user!.id, paymentStatus: 'completed' },
      _sum: { totalAmount: true }
    });

    const recentOrders = await prisma.order.findMany({
      where: { customerId: req.user!.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    });

    res.json({
      totalOrders,
      completedOrders,
      totalSpent: totalSpent._sum.totalAmount || 0,
      recentOrders
    });
  } catch (error) {
    throw error;
  }
});

export default router;
