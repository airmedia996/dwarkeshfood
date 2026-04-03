import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  restaurant_name: z.string().optional(),
  logo: z.string().optional(),
  cover_image: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  minimum_order_amount: z.number().min(0).optional(),
  delivery_fee: z.number().min(0).optional(),
  free_delivery_threshold: z.number().min(0).optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  currency: z.string().optional(),
  currency_symbol: z.string().optional(),
  is_open: z.boolean().optional(),
  allow_preorders: z.boolean().optional(),
  is_delivery_enabled: z.boolean().optional(),
  is_pickup_enabled: z.boolean().optional(),
  max_delivery_distance: z.number().positive().optional(),
  about_us: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  privacy_policy: z.string().optional(),
  social_links: z.record(z.string()).optional()
});

export const getSettings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error || !data) {
      const { data: newSettings, error: createError } = await supabase
        .from('restaurant_settings')
        .insert({})
        .select()
        .single();
      
      if (createError) throw createError;
      return res.json(newSettings);
    }
    
    res.json(data);
  } catch (error) {
    throw error;
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    const data = updateSettingsSchema.parse(req.body);

    const { data: existing } = await supabase
      .from('restaurant_settings')
      .select('id')
      .limit(1)
      .single();

    if (!existing) {
      const { data: settings, error } = await supabase
        .from('restaurant_settings')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return res.json(settings);
    }

    const { data: settings, error } = await supabase
      .from('restaurant_settings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const getPublicInfo = async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('restaurant_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (!data) {
      return res.json({
        restaurant_name: 'Dwarkesh Food',
        is_open: true,
        opening_time: '09:00',
        closing_time: '22:00'
      });
    }

    res.json({
      restaurant_name: data.restaurant_name,
      logo: data.logo,
      cover_image: data.cover_image,
      description: data.description,
      phone: data.phone,
      email: data.email,
      address: data.address,
      opening_time: data.opening_time,
      closing_time: data.closing_time,
      is_open: data.is_open,
      allow_preorders: data.allow_preorders,
      is_delivery_enabled: data.is_delivery_enabled,
      is_pickup_enabled: data.is_pickup_enabled,
      currency: data.currency,
      currency_symbol: data.currency_symbol,
      minimum_order_amount: data.minimum_order_amount,
      delivery_fee: data.delivery_fee,
      free_delivery_threshold: data.free_delivery_threshold,
      about_us: data.about_us
    });
  } catch (error) {
    throw error;
  }
};

export const getDeliveryInfo = async (req: Request, res: Response) => {
  try {
    const { data } = await supabase
      .from('restaurant_settings')
      .select('*')
      .limit(1)
      .single();
    
    res.json({
      is_delivery_enabled: data?.is_delivery_enabled ?? true,
      delivery_fee: data?.delivery_fee ?? 50,
      free_delivery_threshold: data?.free_delivery_threshold ?? 500,
      max_delivery_distance: data?.max_delivery_distance ?? 10
    });
  } catch (error) {
    throw error;
  }
};
