import { Request, Response } from 'express';
import { prisma, io } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendOrderNotification } from '../services/notificationService.js';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!admin || admin.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count({
      where: { role: 'customer' }
    });
    const pendingOrders = await prisma.order.count({
      where: { status: 'pending' }
    });

    const revenue = await prisma.order.aggregate({
      where: { paymentStatus: 'completed' },
      _sum: { totalAmount: true }
    });

    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    res.json({
      totalOrders,
      totalCustomers,
      pendingOrders,
      revenue: revenue._sum.totalAmount || 0,
      topItems
    });
  } catch (error) {
    throw error;
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!admin || admin.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const { status, page = '1', limit = '10' } = req.query;

    let where: any = {};
    if (status) where.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        items: { include: { menuItem: true } }
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where });

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!admin || admin.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { customer: true }
    });

    const statusNotificationMap: Record<string, string> = {
      confirmed: 'order_confirmed',
      preparing: 'preparing',
      ready: 'ready_for_pickup',
      out_for_delivery: 'out_for_delivery',
      delivered: 'delivered',
      cancelled: 'cancelled'
    };

    const notificationType = statusNotificationMap[status];
    if (notificationType && order.customerId) {
      await sendOrderNotification(id, order.customerId, notificationType as any);
    }

    // Emit real-time update
    io.to(`order-${id}`).emit('order:updated', {
      orderId: id,
      status: order.status
    });

    res.json(order);
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!admin || admin.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const users = await prisma.user.findMany({
      where: { role: 'customer' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });

    res.json(users);
  } catch (error) {
    throw error;
  }
};

export const assignDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!admin || admin.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const { orderId, deliveryPersonId } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { deliveryPersonId }
    });

    io.to(`order-${orderId}`).emit('delivery:assigned', {
      orderId,
      deliveryPersonId
    });

    res.json(order);
  } catch (error) {
    throw error;
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!admin || admin.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    // Get daily revenue for last 7 days
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));

    const dailyRevenue = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sevenDaysAgo },
        paymentStatus: 'completed'
      },
      _sum: { totalAmount: true }
    });

    res.json({
      dailyRevenue
    });
  } catch (error) {
    throw error;
  }
};
