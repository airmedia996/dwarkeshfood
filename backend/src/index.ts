import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import chatRoutes from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Socket.io events for real-time tracking
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-user', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined notification room`);
  });

  socket.on('join-chat', (conversationId: string) => {
    socket.join(`chat-${conversationId}`);
    console.log(`User joined chat room: ${conversationId}`);
  });

  socket.on('track-order', (orderId: string) => {
    socket.join(`order-${orderId}`);
    console.log(`User joined room: order-${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Middleware to attach io to request
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).io = io;
  next();
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  server.close();
});

export { prisma, io };
