import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const menuItemSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['snacks', 'curries', 'desserts', 'breads', 'beverages']),
  description: z.string().optional(),
  price: z.number().positive(),
  image: z.string(),
  is_vegetarian: z.boolean().default(true),
  spice_level: z.enum(['mild', 'medium', 'hot']).optional(),
  preparation_time: z.number().positive().optional(),
  availability: z.boolean().default(true)
});

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let query = supabase.from('menu_items').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    throw error;
  }
};

export const getMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new AppError('Menu item not found', 404);
    }

    res.json(data);
  } catch (error) {
    throw error;
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const data = menuItemSchema.parse(req.body);

    const { data: item, error } = await supabase
      .from('menu_items')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = menuItemSchema.partial().parse(req.body);

    const { data: item, error } = await supabase
      .from('menu_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('category');

    if (error) throw error;

    const categories = [...new Set(data?.map(item => item.category) || [])];
    res.json(categories);
  } catch (error) {
    throw error;
  }
};
