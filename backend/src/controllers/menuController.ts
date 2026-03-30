import { Request, Response } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const menuItemSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['snacks', 'curries', 'desserts', 'breads']),
  description: z.string().optional(),
  price: z.number().positive(),
  image: z.string().url(),
  isVegetarian: z.boolean().default(true),
  spiceLevel: z.enum(['mild', 'medium', 'hot']).optional(),
  preparationTime: z.number().positive().optional(),
  availability: z.boolean().default(true)
});

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const items = await prisma.menuItem.findMany({ where });
    res.json(items);
  } catch (error) {
    throw error;
  }
};

export const getMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!item) {
      throw new AppError('Menu item not found', 404);
    }

    res.json(item);
  } catch (error) {
    throw error;
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const data = menuItemSchema.parse(req.body);

    const item = await prisma.menuItem.create({
      data
    });

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

    const item = await prisma.menuItem.update({
      where: { id },
      data
    });

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

    await prisma.menuItem.delete({
      where: { id }
    });

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.menuItem.findMany({
      distinct: ['category'],
      select: { category: true }
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    throw error;
  }
};
