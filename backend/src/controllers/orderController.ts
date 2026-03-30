import { Request, Response } from 'express';
import { prisma, io } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().positive()
    })
  ),
  deliveryAddress: z.string(),
  paymentMethod: z.enum(['stripe', 'momo', 'cash']),
  specialInstructions: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const data = createOrderSchema.parse(req.body);

    // Get menu items and calculate totals
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: data.items.map(i => i.menuItemId) }
      }
    });

    let subtotal = 0;
    const orderItems = data.items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (!menuItem) throw new AppError('Menu item not found', 404);
      subtotal += menuItem.price * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price
      };
    });

    const tax = subtotal * 0.05; // 5% tax
    const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery for orders > 500
    const totalAmount = subtotal + tax + deliveryFee;

    const order = await prisma.order.create({
      data: {
        customerId: req.user!.id,
        subtotal,
        tax,
        deliveryFee,
        totalAmount,
        status: 'pending',
        deliveryAddress: data.deliveryAddress,
        paymentMethod: data.paymentMethod,
        specialInstructions: data.specialInstructions,
        items: {
          create: orderItems
        },
        tracking: {
          create: {
            currentLat: data.latitude,
            currentLng: data.longitude
          }
        }
      },
      include: {
        items: { include: { menuItem: true } }
      }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: req.user!.id,
        amount: totalAmount,
        paymentMethod: data.paymentMethod,
        status: data.paymentMethod === 'cash' ? 'pending' : 'pending'
      }
    });

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.id },
      include: {
        items: { include: { menuItem: true } },
        payment: true,
        tracking: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        payment: true,
        tracking: true
      }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Verify ownership
    if (order.customerId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    res.json(order);
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customerId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new AppError('Cannot cancel order in this status', 400);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    io.to(`order-${id}`).emit('order:updated', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    throw error;
  }
};

export const rateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customerId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { rating, review }
    });

    res.json(updatedOrder);
  } catch (error) {
    throw error;
  }
};

export const trackOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tracking = await prisma.deliveryTracking.findUnique({
      where: { orderId: id }
    });

    if (!tracking) {
      throw new AppError('Tracking not found', 404);
    }

    res.json(tracking);
  } catch (error) {
    throw error;
  }
};
