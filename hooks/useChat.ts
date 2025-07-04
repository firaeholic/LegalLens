// Custom hook for chat functionality
import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage, ChatResponse, UseChatReturn } from '../types'
import { apiClient } from '../lib/apiClient'
import { logger, generateId, debounce, storage } from '../lib/utils'
import { APP_CONFIG, SUGGESTED_QUESTIONS } from '../config/constants'

export function useChat(documentText?: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load chat history from storage
  useEffect(() => {
    const storedMessages = storage.get<ChatMessage[]>(APP_CONFIG.storageKeys.CHAT_HISTORY)
    if (storedMessages && storedMessages.length > 0) {
      setMessages(storedMessages)
      logger.info('Loaded chat history from storage', {
        messageCount: storedMessages.length
      }, 'useChat')
    }
  }, [])

  // Save messages to storage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      storage.set(APP_CONFIG.storageKeys.CHAT_HISTORY, messages)
    }
  }, [messages])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) {
      return
    }

    if (!documentText) {
      setError('No document loaded. Please upload and analyze a document first.')
      return
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    const userMessage: ChatMessage = {
      id: generateId(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    setIsTyping(true)

    try {
      logger.info('Sending chat message', {
        messageId: userMessage.id,
        contentLength: content.length,
        documentTextLength: documentText.length
      }, 'useChat')

      const response = await apiClient.chatWithDocument(content, documentText)

      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        content: response.answer,
        role: 'assistant',
        timestamp: new Date(),
        confidence: response.confidence,
        sources: response.sources
      }

      setMessages(prev => [...prev, assistantMessage])

      logger.info('Chat response received', {
        messageId: assistantMessage.id,
        responseLength: response.answer.length,
        confidence: response.confidence,
        sourcesCount: response.sources?.length || 0
      }, 'useChat')

    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return // Request was cancelled
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to get response'
      setError(errorMessage)
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: generateId(),
        content: `Sorry, I encountered an error: ${errorMessage}`,
        role: 'assistant',
        timestamp: new Date(),
        isError: true
      }

      setMessages(prev => [...prev, errorChatMessage])
      
      logger.error('Chat request failed', err, 'useChat')
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      abortControllerRef.current = null
    }
  }, [documentText, isLoading])

  // Debounced version for real-time typing
  const debouncedSendMessage = useCallback(
    debounce(sendMessage, APP_CONFIG.debounceDelays.SEARCH),
    [sendMessage]
  )

  const clearChat = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setMessages([])
    setError(null)
    setIsLoading(false)
    setIsTyping(false)

    // Clear from storage
    storage.remove(APP_CONFIG.storageKeys.CHAT_HISTORY)

    logger.info('Chat cleared', {}, 'useChat')
  }, [])

  const retryLastMessage = useCallback(() => {
    if (messages.length < 2) return

    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
    if (lastUserMessage) {
      // Remove the last assistant message (which likely failed)
      setMessages(prev => {
        const lastAssistantIndex = prev.map(m => m.role).lastIndexOf('assistant')
        if (lastAssistantIndex !== -1) {
          return prev.slice(0, lastAssistantIndex)
        }
        return prev
      })

      // Retry sending the last user message
      sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  const exportChat = useCallback(() => {
    if (messages.length === 0) {
      logger.warn('No chat messages to export', {}, 'useChat')
      return
    }

    try {
      const exportData = {
        messages,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        documentContext: documentText ? 'Document loaded' : 'No document'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `legallens-chat-${new Date().toISOString().split('T')[0]}.json`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)

      logger.info('Chat exported', {
        messageCount: messages.length
      }, 'useChat')

    } catch (err) {
      logger.error('Failed to export chat', err, 'useChat')
      setError('Failed to export chat')
    }
  }, [messages, documentText])

  const getSuggestedQuestions = useCallback(() => {
    if (!documentText) return SUGGESTED_QUESTIONS.slice(0, 3)

    // Filter suggestions based on document content
    const relevantQuestions = SUGGESTED_QUESTIONS.filter(question => {
      const keywords = question.toLowerCase().split(' ')
      return keywords.some(keyword => 
        documentText.toLowerCase().includes(keyword)
      )
    })

    return relevantQuestions.length > 0 
      ? relevantQuestions.slice(0, 3)
      : SUGGESTED_QUESTIONS.slice(0, 3)
  }, [documentText])

  const getMessageStats = useCallback(() => {
    const userMessages = messages.filter(m => m.role === 'user')
    const assistantMessages = messages.filter(m => m.role === 'assistant')
    const errorMessages = messages.filter(m => m.isError)

    return {
      total: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      errorMessages: errorMessages.length,
      averageConfidence: assistantMessages.reduce((acc, msg) => 
        acc + (msg.confidence || 0), 0) / assistantMessages.length || 0
    }
  }, [messages])

  const findMessageById = useCallback((id: string) => {
    return messages.find(message => message.id === id)
  }, [messages])

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(message => message.id !== id))
    logger.info('Message deleted', { messageId: id }, 'useChat')
  }, [])

  return {
    messages,
    loading: isLoading,
    error,
    sendMessage,
    clearChat,
    suggestedQuestions: getSuggestedQuestions(),
  }
}