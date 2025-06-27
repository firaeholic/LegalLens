import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export default function ChatWithDoc() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [documentContext, setDocumentContext] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load document context from sessionStorage
    const analysisResult = sessionStorage.getItem('analysisResult')
    if (analysisResult) {
      try {
        const parsed = JSON.parse(analysisResult)
        setDocumentContext(parsed.extractedText || '')
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: 'welcome',
          type: 'bot',
          content: "Hello! I'm here to help you understand your legal document. You can ask me questions about specific clauses, terms, or any part of the document. What would you like to know?",
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
      } catch (err) {
        console.error('Failed to load document context:', err)
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          context: documentContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const { answer } = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: answer,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const suggestedQuestions = [
    "What are the key terms and conditions?",
    "Are there any risky clauses I should be aware of?",
    "What are my obligations under this contract?",
    "What happens if I want to terminate this agreement?",
    "Are there any penalties or fees mentioned?"
  ]

  return (
    <div className="card h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-primary-600" />
          Chat with Document
        </h3>
        <span className="text-sm text-gray-500">
          {messages.length - 1} messages
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <Bot className="w-4 h-4 mt-0.5 text-primary-600" />
                )}
                {message.type === 'user' && (
                  <User className="w-4 h-4 mt-0.5 text-white" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin text-primary-600" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputValue(question)}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex space-x-2">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about the document..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}