import { Request, Response } from 'express';
import { prisma } from '../index.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import Stripe from 'stripe';
import axios from 'axios';
import crypto from 'crypto';
import { z } from 'zod';
import { sendOrderNotification } from '../services/notificationService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const stripeIntentSchema = z.object({
  orderId: z.string()
});

const confirmPaymentSchema = z.object({
  orderId: z.string(),
  paymentIntentId: z.string()
});

const momoPaymentSchema = z.object({
  orderId: z.string(),
  phone: z.string()
});

const MOMO_CONFIG = {
  baseUrl: process.env.MOMO_ENV === 'production' 
    ? 'https://proxy.momoapi.mtn.com' 
    : 'https://sandbox.momodeveloper.mtn.com',
  apiKey: process.env.MOMO_API_KEY || '',
  apiUser: process.env.MOMO_API_USER || '',
  referenceId: crypto.randomUUID(),
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getMomoToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const response = await axios.post(
      `${MOMO_CONFIG.baseUrl}/collection/token/`,
      {},
      {
        headers: {
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.apiKey,
        },
        auth: {
          username: MOMO_CONFIG.apiUser,
          password: MOMO_CONFIG.apiKey,
        },
      }
    );

    cachedToken = {
      token: response.data.access_token,
      expiresAt: Date.now() + 3500 * 1000,
    };

    return cachedToken.token;
  } catch (error: any) {
    console.error('Momo token error:', error.response?.data || error.message);
    throw new AppError('Failed to get Momo token', 500);
  }
}

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
      amount: Math.round(order.totalAmount * 100),
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

      await sendOrderNotification(data.orderId, req.user!.id, 'payment_received');

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

export const initiateMomoPayment = async (req: AuthRequest, res: Response) => {
  try {
    const data = momoPaymentSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: data.orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.customerId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    const phone = data.phone || user?.phone || '';
    const externalId = crypto.randomUUID();
    const amount = order.totalAmount.toString();
    const currency = 'GHS';

    const isSimulationMode = !MOMO_CONFIG.apiKey || MOMO_CONFIG.apiKey === 'your_momo_api_key';

    if (isSimulationMode) {
      await prisma.payment.update({
        where: { orderId: data.orderId },
        data: {
          status: 'pending',
          transactionId: `SIM_${externalId.substring(0, 8)}`,
          paymentGatewayResponse: {
            mode: 'simulation',
            message: 'Momo payment in simulation mode',
            phone,
            amount,
            currency,
            referenceId: externalId
          } as any
        }
      });

      await prisma.order.update({
        where: { id: data.orderId },
        data: { paymentMethod: 'momo' }
      });

      return res.json({
        success: true,
        simulation: true,
        message: 'Momo payment initiated (Simulation Mode)',
        referenceId: externalId,
        instructions: 'In simulation mode, payment is auto-confirmed for testing. In production, customer would receive a USSD prompt.',
        phone,
        amount,
        currency
      });
    }

    const token = await getMomoToken();
    const referenceId = crypto.randomUUID();

    const momoResponse = await axios.post(
      `${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay`,
      {
        amount,
        currency,
        externalId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: phone.replace(/^0/, '233')
        },
        payerMessage: `Dwarkesh Food Order Payment - ${order.id.substring(0, 8)}`,
        payeeNote: `Order payment for ${order.id.substring(0, 8)}`
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': process.env.MOMO_ENV === 'production' ? 'mtnuganda' : 'sandbox',
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    await prisma.payment.update({
      where: { orderId: data.orderId },
      data: {
        status: 'pending',
        transactionId: referenceId,
        paymentGatewayResponse: momoResponse.data as any
      }
    });

    await prisma.order.update({
      where: { id: data.orderId },
      data: { paymentMethod: 'momo' }
    });

    res.json({
      success: true,
      referenceId,
      message: 'Momo payment request sent. Please approve on your phone.',
      phone,
      amount,
      currency
    });

  } catch (error: any) {
    console.error('Momo payment error:', error.response?.data || error.message);
    
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid input', 400);
    }
    
    const errorMsg = error.response?.data?.message || error.message;
    throw new AppError(`Momo payment failed: ${errorMsg}`, 400);
  }
};

export const checkMomoPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { referenceId } = req.params;

    const isSimulationMode = !MOMO_CONFIG.apiKey || MOMO_CONFIG.apiKey === 'your_momo_api_key';

    if (isSimulationMode) {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: { contains: referenceId.substring(0, 8) } }
      });

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      return res.json({
        status: payment.status,
        simulation: true,
        message: payment.status === 'completed' 
          ? 'Payment completed (simulation)' 
          : 'Payment pending (simulation)'
      });
    }

    const token = await getMomoToken();

    const response = await axios.get(
      `${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': process.env.MOMO_ENV === 'production' ? 'mtnuganda' : 'sandbox',
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.apiKey
        }
      }
    );

    res.json({
      status: response.data.status,
      externalId: response.data.external_id,
      amount: response.data.amount,
      currency: response.data.currency
    });

  } catch (error: any) {
    console.error('Momo status check error:', error.response?.data || error.message);
    throw new AppError('Failed to check payment status', 500);
  }
};

export const momoWebhookCallback = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-momo-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.MOMO_WEBHOOK_SECRET || '')
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature && signature !== expectedSignature) {
      throw new AppError('Invalid webhook signature', 401);
    }

    const { referenceId, status, externalId, amount } = req.body;

    if (status === 'SUCCESSFUL' || status === 'COMPLETED') {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: referenceId }
      });

      if (payment && payment.status !== 'completed') {
        await prisma.payment.update({
          where: { orderId: payment.orderId },
          data: {
            status: 'completed',
            transactionId: referenceId,
            paymentGatewayResponse: req.body as any
          }
        });

        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'completed',
            status: 'confirmed'
          }
        });

        await sendOrderNotification(payment.orderId, payment.userId, 'payment_received');
      }
    }

    res.status(200).json({ status: 'received' });

  } catch (error) {
    console.error('Momo webhook error:', error);
    res.status(500).json({ status: 'error' });
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

export const getPaymentByOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { orderId }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    res.json(payment);
  } catch (error) {
    throw error;
  }
};
