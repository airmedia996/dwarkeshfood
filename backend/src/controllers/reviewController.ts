import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const createReviewSchema = z.object({
  orderId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  foodRating: z.number().min(1).max(5).optional(),
  serviceRating: z.number().min(1).max(5).optional(),
  deliveryRating: z.number().min(1).max(5).optional()
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  foodRating: z.number().min(1).max(5).optional(),
  serviceRating: z.number().min(1).max(5).optional(),
  deliveryRating: z.number().min(1).max(5).optional()
});

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const data = createReviewSchema.parse(req.body);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', data.orderId)
      .single();

    if (orderError || !order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customer_id !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    if (order.status !== 'delivered') {
      throw new AppError('Can only review delivered orders', 400);
    }

    const { data: existingReview } = await supabase
      .from('reviews')
      .select('*')
      .eq('order_id', data.orderId)
      .single();

    if (existingReview) {
      throw new AppError('Order already reviewed', 400);
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        order_id: data.orderId,
        user_id: req.user!.id,
        rating: data.rating,
        comment: data.comment,
        food_rating: data.foodRating,
        service_rating: data.serviceRating,
        delivery_rating: data.deliveryRating,
        is_verified: true
      })
      .select()
      .single();

    if (error) throw error;

    await updateMenuItemRatings(data.orderId);

    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const getOrderReview = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles!user_id(name, profile_image)')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      throw new AppError('Review not found', 404);
    }

    res.json(data);
  } catch (error) {
    throw error;
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateReviewSchema.parse(req.body);

    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingReview) {
      throw new AppError('Review not found', 404);
    }

    if (existingReview.user_id !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data.rating || data.foodRating) {
      await updateMenuItemRatings(existingReview.order_id);
    }

    res.json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const getMenuItemReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { menuItemId } = req.params;

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('menu_item_id', menuItemId);

    const orderIds = orderItems?.map(o => o.order_id) || [];

    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles!user_id(name, profile_image)')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    throw error;
  }
};

export const getRecentReviews = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles!user_id(name, profile_image), orders!order_id(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    throw error;
  }
};

export const getOverallRating = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating');
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const totalRating = data.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / data.length;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(r => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    res.json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: data.length,
      distribution
    });
  } catch (error) {
    throw error;
  }
};

async function updateMenuItemRatings(orderId: string) {
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('menu_item_id')
    .eq('order_id', orderId);

  if (!orderItems) return;

  for (const item of orderItems) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('order_id', orderId);

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / reviews.length;

      await supabase
        .from('menu_items')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          review_count: reviews.length
        })
        .eq('id', item.menu_item_id);
    }
  }
}
