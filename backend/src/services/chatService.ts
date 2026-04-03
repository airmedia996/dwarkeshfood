import { prisma, io } from '../index.js';

export const createConversation = async (userId: string) => {
  const existing = await prisma.chatConversation.findFirst({
    where: { userId, status: 'active' },
    orderBy: { updatedAt: 'desc' }
  });

  if (existing) return existing;

  return prisma.chatConversation.create({
    data: { userId }
  });
};

export const getConversation = async (conversationId: string) => {
  return prisma.chatConversation.findUnique({
    where: { id: conversationId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } }
    }
  });
};

export const getUserConversation = async (userId: string) => {
  return prisma.chatConversation.findFirst({
    where: { userId, status: 'active' },
    include: {
      messages: { 
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderType: 'user' | 'admin',
  content: string
) => {
  const message = await prisma.chatMessage.create({
    data: {
      conversationId,
      senderId,
      senderType,
      content
    }
  });

  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { lastMessage: content, updatedAt: new Date() }
  });

  io.to(`chat-${conversationId}`).emit('chat:message', message);

  return message;
};

export const getConversations = async (adminId: string) => {
  return prisma.chatConversation.findMany({
    where: { status: 'active' },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      messages: { 
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
};

export const closeConversation = async (conversationId: string, adminId: string) => {
  return prisma.chatConversation.update({
    where: { id: conversationId },
    data: { status: 'closed', adminId }
  });
};

export const getUnreadCount = async (conversationId: string) => {
  return prisma.chatMessage.count({
    where: { conversationId, isRead: false, senderType: 'admin' }
  });
};

export const markAsRead = async (messageIds: string[]) => {
  return prisma.chatMessage.updateMany({
    where: { id: { in: messageIds } },
    data: { isRead: true }
  });
};