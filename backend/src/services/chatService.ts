import { supabase } from '../lib/supabase.js';
import { io } from '../index.js';

export const createConversation = async (userId: string) => {
  const { data: existing } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getConversation = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*, profiles!user_id(id, name, email), chat_messages(*)')
    .eq('id', conversationId)
    .single();

  if (error) throw error;
  return data;
};

export const getUserConversation = async (userId: string) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*, chat_messages(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderType: 'user' | 'admin',
  content: string
) => {
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: senderType,
      content
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('chat_conversations')
    .update({ 
      last_message: content, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', conversationId);

  if (io) {
    io.to(`chat-${conversationId}`).emit('chat:message', message);
  }

  return message;
};

export const getConversations = async (adminId: string) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*, profiles!user_id(id, name, email, phone), chat_messages(*)')
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const closeConversation = async (conversationId: string, adminId: string) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .update({ status: 'closed', admin_id: adminId })
    .eq('id', conversationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUnreadCount = async (conversationId: string) => {
  const { count, error } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('is_read', false)
    .eq('sender_type', 'admin');

  if (error) throw error;
  return count || 0;
};

export const markAsRead = async (messageIds: string[]) => {
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .in('id', messageIds);

  if (error) throw error;
};
