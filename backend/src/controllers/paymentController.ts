import { Request, Response } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const stripeIntentSchema = z.object({
  orderId: z.string()
});

const confirmPaymentSchema = z.object({
  orderId: z.string(),
  paymentIntentId: z.string()
});

export const createStripeIntent = async (req: AuthRequest, res: Response) => {
  try {
    const data = stripeIntentSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: data.orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customerId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Amount in cents
      currency: 'usd',
      metadata: {
        orderId: data.orderId,
        userId: req.user!.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const confirmStripePayment = async (req: AuthRequest, res: Response) => {
  try {
    const data = confirmPaymentSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: data.orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customerId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(data.paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await prisma.payment.update({
        where: { orderId: data.orderId },
        data: {
          status: 'completed',
          transactionId: paymentIntent.id,
          paymentGatewayResponse: paymentIntent as any
        }
      });

      await prisma.order.update({
        where: { id: data.orderId },
        data: {
          paymentStatus: 'completed',
          status: 'confirmed'
        }
      });

      res.json({ message: 'Payment successful' });
    } else {
      throw new AppError('Payment not succeeded', 400);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    throw error;
  }
};

export const initiateModiPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Placeholder for Momo API integration
    // In real implementation, make API call to Momo provider

    res.json({
      message: 'Momo payment initiated',
      orderId,
      amount: order.totalAmount
    });
  } catch (error) {
    throw error;
  }
};

export const momoWebhookCallback = async (req: Request, res: Response) => {
  try {
    // TODO: Verify Momo webhook signature
    const { orderId, status, transactionId } = req.body;

    if (status === 'success') {
      await prisma.payment.update({
        where: { orderId },
        data: {
          status: 'completed',
          transactionId
        }
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'completed',
          status: 'confirmed'
        }
      });
    }

    res.json({ message: 'Webhook processed' });
  } catch (error) {
    throw error;
  }
};

export const confirmCashPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customerId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    // For cash, just create pending payment
    await prisma.payment.update({
      where: { orderId },
      data: {
        status: 'pending'
      }
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'confirmed' }
    });

    res.json({ message: 'Order confirmed. Pay on delivery.' });
  } catch (error) {
    throw error;
  }
};

export const getPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    res.json(payment);
  } catch (error) {
    throw error;
  }
};
