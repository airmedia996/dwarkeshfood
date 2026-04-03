import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { data: completedOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'completed');

    const revenue = completedOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    res.json({
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      pendingOrders: pendingOrders || 0,
      revenue
    });
  } catch (error) {
    throw error;
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const { status, page = '1', limit = '10' } = req.query;

    let query = supabase
      .from('orders')
      .select('*, profiles!customer_id(name, email, phone), order_items(*, menu_items(*))', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status as string);
    }

    const from = (parseInt(page as string) - 1) * parseInt(limit as string);
    const to = from + parseInt(limit as string) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      orders: data || [],
      pagination: {
        total: count || 0,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil((count || 0) / parseInt(limit as string))
      }
    });
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const { id } = req.params;
    const { status } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*, profiles!customer_id(*)')
      .single();

    if (error) throw error;

    res.json(order);
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, created_at')
      .eq('role', 'customer');

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    throw error;
  }
};

export const assignDelivery = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    const { orderId, deliveryPersonId } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ delivery_person_id: deliveryPersonId })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    res.json(order);
  } catch (error) {
    throw error;
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      throw new AppError('Unauthorized', 403);
    }

    res.json({ message: 'Analytics endpoint - to be implemented' });
  } catch (error) {
    throw error;
  }
};
