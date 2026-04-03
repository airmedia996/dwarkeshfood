import express from 'express';
import { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error || !data) {
      throw new AppError('User not found', 404);
    }

    res.json(data);
  } catch (error) {
    throw error;
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, city, zip_code, profile_image } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        zip_code: zip_code || undefined,
        profile_image: profile_image || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    throw error;
  }
});

router.get('/addresses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('is_default', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    throw error;
  }
});

router.post('/addresses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { label, full_address, city, zip_code, latitude, longitude, is_default } = req.body;

    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user!.id)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: req.user!.id,
        label,
        full_address,
        city,
        zip_code,
        latitude,
        longitude,
        is_default: is_default || false
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    throw error;
  }
});

router.put('/addresses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { label, full_address, city, zip_code, latitude, longitude, is_default } = req.body;

    const { data: existing } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (!existing) {
      throw new AppError('Address not found', 404);
    }

    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user!.id)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update({
        label: label || undefined,
        full_address: full_address || undefined,
        city: city || undefined,
        zip_code: zip_code || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        is_default: is_default !== undefined ? is_default : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    throw error;
  }
});

router.delete('/addresses/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (!existing) {
      throw new AppError('Address not found', 404);
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    throw error;
  }
});

router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Password change is handled by Supabase Auth' });
});

router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', req.user!.id);

    const { count: completedOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', req.user!.id)
      .eq('status', 'delivered');

    const { data: spentData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('customer_id', req.user!.id)
      .eq('payment_status', 'completed');

    const totalSpent = spentData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('customer_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      totalOrders: totalOrders || 0,
      completedOrders: completedOrders || 0,
      totalSpent,
      recentOrders: recentOrders || []
    });
  } catch (error) {
    throw error;
  }
});

export default router;
