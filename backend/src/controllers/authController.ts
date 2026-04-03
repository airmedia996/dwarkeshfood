import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

let supabaseAdmin: SupabaseClient | null = null;

const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdmin;
};

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10).optional(),
  role: z.enum(['customer', 'admin']).default('customer')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const { data: authData, error: authError } = await getSupabaseAdmin().auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone || '',
          role: data.role
        }
      }
    });

    if (authError) {
      throw new AppError(authError.message, 400);
    }

    if (!authData.user) {
      throw new AppError('Failed to create user', 400);
    }

    const { data: profile, error: profileError } = await getSupabaseAdmin()
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: data.name,
        phone: data.phone || '',
        role: data.role
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    res.status(201).json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: data.name,
        role: data.role
      },
      session: authData.session
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

    const { data: authData, error: authError } = await getSupabaseAdmin().auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (authError) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!authData.user) {
      throw new AppError('Login failed', 401);
    }

    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    res.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile?.name || authData.user.user_metadata?.name,
        phone: profile?.phone || authData.user.user_metadata?.phone,
        role: profile?.role || 'customer'
      },
      session: authData.session
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const { error } = await getSupabaseAdmin().auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error && error.message !== 'User not found') {
      throw new AppError(error.message, 400);
    }

    res.json({ message: 'If the email exists, a reset link will be sent' });
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

    const { error } = await getSupabaseAdmin().auth.verifyOtp({
      email: '',
      token,
      type: 'recovery'
    });

    if (error) {
      throw new AppError('Invalid or expired token', 400);
    }

    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid token', 401);
    }

    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name,
        phone: profile?.phone || user.user_metadata?.phone,
        role: profile?.role || 'customer'
      }
    });
  } catch (error) {
    throw error;
  }
};
