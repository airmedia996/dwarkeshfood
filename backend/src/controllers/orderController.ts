import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { sendOrderNotification } from '../services/notificationService.js';

const formatPriceShort = (amount: number) => `₵${amount.toFixed(2)}`;

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

    const menuItemIds = data.items.map(i => i.menuItemId);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .in('id', menuItemIds);

    if (menuError || !menuItems) {
      throw new AppError('Failed to fetch menu items', 400);
    }

    let subtotal = 0;
    const orderItems = data.items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (!menuItem) throw new AppError('Menu item not found', 404);
      subtotal += menuItem.price * item.quantity;
      return {
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price
      };
    });

    const tax = subtotal * 0.05;
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const totalAmount = subtotal + tax + deliveryFee;
    
    const prepTime = Math.max(...orderItems.map(o => {
      const item = menuItems.find(m => m.id === o.menu_item_id);
      return item?.preparation_time || 30;
    }));
    const deliveryTime = 15;
    const estimatedMinutes = prepTime + deliveryTime;
    const estimatedDeliveryTime = new Date(Date.now() + estimatedMinutes * 60000).toISOString();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: req.user!.id,
        subtotal,
        tax,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        status: 'pending',
        delivery_address: data.deliveryAddress,
        payment_method: data.paymentMethod,
        special_instructions: data.specialInstructions,
        estimated_delivery_time: estimatedDeliveryTime
      })
      .select()
      .single();

    if (orderError) throw orderError;

    for (const item of orderItems) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: item.price
        });
      if (itemError) throw itemError;
    }

    const { error: trackingError } = await supabase
      .from('delivery_tracking')
      .insert({
        order_id: order.id,
        current_lat: data.latitude,
        current_lng: data.longitude
      });

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        user_id: req.user!.id,
        amount: totalAmount,
        payment_method: data.paymentMethod,
        status: 'pending'
      });

    if (paymentError) console.error('Payment error:', paymentError);

    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(*))')
      .eq('id', order.id)
      .single();

    res.status(201).json(fullOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(*)), payments(*), delivery_tracking(*)')
      .eq('customer_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(*)), payments(*), delivery_tracking(*)')
      .eq('id', id)
      .single();

    if (error || !order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customer_id !== req.user!.id) {
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

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customer_id !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new AppError('Cannot cancel order in this status', 400);
    }

    let refundAmount = 0;
    if (order.payment_status === 'completed') {
      refundAmount = order.status === 'pending' ? order.total_amount : order.total_amount * 0.5;
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (refundAmount > 0) {
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('order_id', id);
    }

    res.json({
      ...updatedOrder,
      refundAmount,
      refundMessage: refundAmount > 0 
        ? `Your refund of ${formatPriceShort(refundAmount)} will be processed within 5-7 business days.`
        : 'No refund applicable for this order.'
    });
  } catch (error) {
    throw error;
  }
};

export const rateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ rating, review })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(order);
  } catch (error) {
    throw error;
  }
};

export const trackOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('delivery_tracking')
      .select('*')
      .eq('order_id', id)
      .single();

    if (error) {
      throw new AppError('Tracking not found', 404);
    }

    res.json(data);
  } catch (error) {
    throw error;
  }
};
