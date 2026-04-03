import { prisma } from '../index.js';
import { io } from '../index.js';

export type NotificationType = 
  | 'order_placed'
  | 'order_confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'payment_received'
  | 'payment_failed';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
  data?: Record<string, unknown>;
}

export const createNotification = async (data: CreateNotificationData) => {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      orderId: data.orderId,
      data: data.data as unknown as Record<string, string> | null
    }
  });

  io.to(`user-${data.userId}`).emit('notification', notification);

  return notification;
};

export const getUserNotifications = async (userId: string, limit = 20) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
};

export const markAsRead = async (notificationId: string, userId: string) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true }
  });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
};

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { userId, isRead: false }
  });
};

export const sendOrderNotification = async (
  orderId: string,
  userId: string,
  type: NotificationType,
  customMessage?: string
) => {
  const messages: Record<NotificationType, { title: string; message: string }> = {
    order_placed: {
      title: 'Order Placed',
      message: customMessage || 'Your order has been placed successfully!'
    },
    order_confirmed: {
      title: 'Order Confirmed',
      message: customMessage || 'Your order has been confirmed by the restaurant.'
    },
    preparing: {
      title: 'Preparing Your Order',
      message: customMessage || 'The restaurant is preparing your delicious food.'
    },
    ready_for_pickup: {
      title: 'Ready for Pickup',
      message: customMessage || 'Your order is ready for pickup!'
    },
    out_for_delivery: {
      title: 'Out for Delivery',
      message: customMessage || 'Your order is on its way!'
    },
    delivered: {
      title: 'Order Delivered',
      message: customMessage || 'Your order has been delivered. Enjoy your meal!'
    },
    cancelled: {
      title: 'Order Cancelled',
      message: customMessage || 'Your order has been cancelled.'
    },
    payment_received: {
      title: 'Payment Successful',
      message: customMessage || 'Payment for your order has been received.'
    },
    payment_failed: {
      title: 'Payment Failed',
      message: customMessage || 'Payment for your order failed. Please try again.'
    }
  };

  const { title, message } = messages[type];

  return createNotification({
    userId,
    type,
    title,
    message,
    orderId
  });
};