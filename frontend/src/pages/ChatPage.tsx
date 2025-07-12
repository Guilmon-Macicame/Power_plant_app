import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Download, 
  MoreVertical, 
  Bot, 
  User, 
  FileText,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: Date
  attachments?: string[]
  context?: string[]
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Get context from URL params
  const mode = searchParams.get('mode')
  const engine = searchParams.get('engine')
  const alarm = searchParams.get('alarm')
  const description = searchParams.get('description')

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Initialize conversation based on mode and context
    if (mode && engine && description) {
      const contextMessage = `I'm working on ${engine} with a ${alarm ? `${alarm} alarm` : 'issue'}. ${description}`
      
      const initialMessages: Message[] = [
        {
          id: '1',
          content: contextMessage,
          type: 'user',
          timestamp: new Date(),
          context: [engine, alarm, description].filter(Boolean)
        }
      ]
      
      setMessages(initialMessages)
      handleAIResponse(contextMessage, mode)
    }
  }, [mode, engine, alarm, description])

  const handleAIResponse = async (userMessage: string, chatMode?: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          mode: chatMode || mode,
          context: {
            engine,
            alarm,
            description
          },
          history: messages.slice(-5) // Send last 5 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        type: 'assistant',
        timestamp: new Date(),
        context: data.context || []
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      toast.error('Failed to get AI response')
      console.error('AI response error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      type: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    await handleAIResponse(inputMessage)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const exportChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.type === 'user' ? 'User' : 'AI Assistant'} (${msg.timestamp.toLocaleString()}): ${msg.content}`
    ).join('\n\n')
    
    const blob = new Blob([chatContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `power-plant-chat-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getModeTitle = () => {
    switch (mode) {
      case 'rca':
        return 'Root Cause Analysis'
      case 'fmea':
        return 'FMEA Analysis'
      case 'fishbone':
        return 'Fishbone Diagram'
      case 'historical':
        return 'Historical Data'
      default:
        return 'AI Assistant'
    }
  }

  const getModeDescription = () => {
    switch (mode) {
      case 'rca':
        return 'Identifying root causes of the failure'
      case 'fmea':
        return 'Analyzing failure modes and effects'
      case 'fishbone':
        return 'Creating cause and effect diagrams'
      case 'historical':
        return 'Reviewing past incidents and solutions'
      default:
        return 'General troubleshooting assistance'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getModeTitle()}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getModeDescription()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={exportChat}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Export Chat"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Context Banner */}
      {(engine || alarm || description) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border-b border-primary/20 px-4 py-3"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 text-sm">
              <span className="font-medium text-primary">Context:</span>
              {engine && (
                <span className="px-2 py-1 bg-primary/20 text-primary rounded">
                  {engine}
                </span>
              )}
              {alarm && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                  {alarm}
                </span>
              )}
              {description && (
                <span className="text-gray-600 dark:text-gray-400 truncate max-w-md">
                  {description}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex items-start space-x-4 mb-6 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-2xl ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <p className="mb-0 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.context && message.context.length > 0 && (
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>{message.context.length} references</span>
                      </span>
                    )}
                  </div>
                </div>
                
                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-4 mb-6"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-gray-600 dark:text-gray-400">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full p-4 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                rows={1}
                style={{ minHeight: '60px', maxHeight: '120px' }}
              />
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 bottom-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
            
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ChatPage