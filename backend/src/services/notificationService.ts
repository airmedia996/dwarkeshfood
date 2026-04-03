import { supabase } from '../lib/supabase.js';
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
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      order_id: data.orderId,
      data: data.data as any
    })
    .select()
    .single();

  if (error) throw error;
  if (io && notification) {
    io.to(`user-${data.userId}`).emit('notification', notification);
  }

  return notification;
};

export const getUserNotifications = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const markAsRead = async (notificationId: string, userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const markAllAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
};

export const getUnreadCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
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
