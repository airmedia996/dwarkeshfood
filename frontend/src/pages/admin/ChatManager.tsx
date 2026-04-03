import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../services/api'

interface Message {
  id: string
  senderId: string
  senderType: string
  content: string
  isRead: boolean
  createdAt: string
}

interface Conversation {
  id: string
  userId: string
  user: { id: string; name: string; email: string; phone: string }
  status: string
  lastMessage?: string
  createdAt: string
  messages?: Message[]
}

const ChatManager: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/admin/conversations')
      setConversations(response.data)
    } catch (error) {
      console.error('Failed to fetch conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const selectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv)
    try {
      const response = await api.get(`/chat/conversation/${conv.id}`)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    try {
      const response = await api.post(`/chat/conversation/${selectedConversation.id}/message`, {
        content: newMessage
      })
      setMessages([...messages, response.data])
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message')
    }
  }

  const closeConversation = async () => {
    if (!selectedConversation) return
    if (!confirm('Close this conversation?')) return
    try {
      await api.post(`/chat/admin/conversation/${selectedConversation.id}/close`)
      setSelectedConversation(null)
      fetchConversations()
    } catch (error) {
      console.error('Failed to close conversation')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gold mb-2">💬 Support Chats</h1>
          <p className="text-gray-400">Manage customer support conversations</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="bg-dark-coffee border border-coffee rounded-lg p-4">
            <h2 className="text-xl font-bold text-gold mb-4">Active Conversations</h2>
            <div className="space-y-3">
              {conversations.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No active conversations</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.id === conv.id
                        ? 'bg-gold text-black'
                        : 'bg-black hover:bg-coffee'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{conv.user?.name || 'Unknown User'}</p>
                        <p className={`text-sm ${selectedConversation?.id === conv.id ? 'text-black/70' : 'text-gray-400'}`}>
                          {conv.user?.email}
                        </p>
                      </div>
                      <span className={`text-xs ${selectedConversation?.id === conv.id ? 'text-black/70' : 'text-gray-500'}`}>
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {conv.lastMessage && (
                      <p className={`text-sm mt-2 truncate ${selectedConversation?.id === conv.id ? 'text-black/70' : 'text-gray-400'}`}>
                        {conv.lastMessage}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-dark-coffee border border-coffee rounded-lg flex flex-col h-[600px]">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-coffee flex justify-between items-center">
                  <div>
                    <h3 className="text-gold font-bold">{selectedConversation.user?.name}</h3>
                    <p className="text-gray-400 text-sm">{selectedConversation.user?.email} • {selectedConversation.user?.phone}</p>
                  </div>
                  <button
                    onClick={closeConversation}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Close Chat
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.senderType === 'admin'
                            ? 'bg-gold text-black'
                            : 'bg-coffee text-white'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderType === 'admin' ? 'text-black/60' : 'text-gray-400'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-coffee">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 bg-black border border-coffee rounded text-white focus:border-gold focus:outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-gold text-black rounded font-bold hover:bg-yellow-500 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-4xl mb-2">💬</p>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatManager