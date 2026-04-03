import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'
import { RootState } from '../store/index'

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
  status: string
  lastMessage?: string
  messages: Message[]
}

const ChatSupport: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen && token) {
      initChat()
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [isOpen, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initChat = async () => {
    setIsLoading(true)
    try {
      let convResponse = await api.get('/chat/conversation')
      if (!convResponse.data) {
        convResponse = await api.post('/chat/conversation')
      }
      setConversation(convResponse.data)
      setMessages(convResponse.data.messages || [])

      if (!socketRef.current) {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
          auth: { token }
        })
      }
      socketRef.current.emit('join-chat', convResponse.data.id)

      socketRef.current.on('chat:message', (message: Message) => {
        setMessages(prev => [...prev, message])
      })
    } catch (error) {
      console.error('Failed to init chat')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation) return
    try {
      await api.post(`/chat/conversation/${conversation.id}/message`, {
        content: newMessage
      })
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!token) return null

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gold rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform z-40"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 right-6 w-80 h-[500px] bg-dark-coffee border-2 border-coffee rounded-xl shadow-2xl flex flex-col z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-coffee bg-black/30 rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="text-gold font-bold">Support Chat</h3>
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-2"></div>
                Connecting...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p className="text-4xl mb-2">👋</p>
                <p>Start a conversation</p>
                <p className="text-sm">We'll respond as soon as possible</p>
              </div>
            ) : (
              messages.map((msg, _index) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.senderType === 'user'
                        ? 'bg-gold text-black'
                        : 'bg-coffee text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.senderType === 'user' ? 'text-black/60' : 'text-gray-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-coffee">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-black border border-coffee rounded-full text-white text-sm focus:border-gold focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="w-10 h-10 bg-gold rounded-full flex items-center justify-center hover:bg-yellow-500 disabled:opacity-50 transition-colors"
              >
                ➤
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default ChatSupport