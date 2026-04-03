import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(['customer', 'admin']).default('customer')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const logout = async (req: Request, res: Response) => {
  // Token-based auth doesn't require server-side logout
  res.json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists
      res.json({ message: 'If the email exists, a reset link will be sent' });
      return;
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, type: 'password-reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // Store reset token in user (or create a separate table for tokens)
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        // In production, store a hashed token. Here we rely on JWT
      }
    });

    // In production, send email with reset link
    // For now, return the token (in production, send via email)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    console.log(`Password Reset URL: ${resetUrl}`);
    
    // In production, you would use nodemailer to send email:
    // await sendEmail({ to: email, subject: 'Password Reset', text: `Reset your password at: ${resetUrl}` });

    res.json({ 
      message: 'If the email exists, a reset link will be sent',
      // Remove this in production
      resetToken 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new AppError('Token and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

    if (decoded.type !== 'password-reset') {
      throw new AppError('Invalid token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid or expired token', 400);
    }
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};
