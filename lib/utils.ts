// Utility functions for LegalLens AI
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { APIError } from '../types'
import { ERROR_CODES, ERROR_MESSAGES } from '../config/constants'

// Tailwind CSS class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Error handling utilities
export class AppError extends Error {
  public readonly code: string
  public readonly details?: any
  public readonly timestamp: Date

  constructor(code: string, message?: string, details?: any) {
    super(message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || 'An unknown error occurred')
    this.code = code
    this.details = details
    this.timestamp = new Date()
    this.name = 'AppError'
  }

  toAPIError(): APIError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    }
  }
}

// Logging utilities
export const logger = {
  error: (message: string, error?: any, context?: string) => {
    const logEntry = {
      level: 'ERROR',
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      context,
      timestamp: new Date().toISOString()
    }
    console.error('[LegalLens]', logEntry)
  },
  
  warn: (message: string, data?: any, context?: string) => {
    const logEntry = {
      level: 'WARN',
      message,
      data,
      context,
      timestamp: new Date().toISOString()
    }
    console.warn('[LegalLens]', logEntry)
  },
  
  info: (message: string, data?: any, context?: string) => {
    const logEntry = {
      level: 'INFO',
      message,
      data,
      context,
      timestamp: new Date().toISOString()
    }
    console.info('[LegalLens]', logEntry)
  },
  
  debug: (message: string, data?: any, context?: string) => {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = {
        level: 'DEBUG',
        message,
        data,
        context,
        timestamp: new Date().toISOString()
      }
      console.debug('[LegalLens]', logEntry)
    }
  }
}

// File validation utilities
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

export function detectFileTypeFromExtension(fileName: string): string {
  const ext = getFileExtension(fileName)
  const mimeMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp'
  }
  return mimeMap[ext] || ''
}

export function isValidFileType(file: File): boolean {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()
  
  // Check common image and PDF types
  const validTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ]
  
  const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp']
  
  return validTypes.includes(fileType) || 
         validExtensions.some(ext => fileName.endsWith(ext)) ||
         fileType.includes('png') || fileType.includes('jpeg') || 
         fileType.includes('pdf') || fileType.includes('webp')
}

// File conversion utilities
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new AppError(ERROR_CODES.INVALID_INPUT, 'Failed to convert file to base64'))
      }
    }
    reader.onerror = () => reject(new AppError(ERROR_CODES.INVALID_INPUT, 'Failed to read file'))
  })
}

export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], filename, { type: mime })
}

// Storage utilities
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      logger.error('Failed to get item from storage', error, 'storage.get')
      return null
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      logger.error('Failed to set item in storage', error, 'storage.set')
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      logger.error('Failed to remove item from storage', error, 'storage.remove')
    }
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.clear()
    } catch (error) {
      logger.error('Failed to clear storage', error, 'storage.clear')
    }
  }
}

// Format utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Text processing utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}

export function extractKeywords(text: string, count: number = 10): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
    'those', 'will', 'shall', 'may', 'can', 'could', 'would', 'should'
  ])
  
  const wordCount = new Map<string, number>()
  
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }
  })
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word)
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Retry utility
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, lastError, 'retry')
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error
  let currentDelay = initialDelay
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      logger.warn(`Attempt ${attempt} failed, retrying in ${currentDelay}ms`, lastError, 'retryWithBackoff')
      await new Promise(resolve => setTimeout(resolve, currentDelay))
      currentDelay *= backoffMultiplier
    }
  }
  
  throw lastError!
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Calculate risk score
export function calculateRiskScore(clauses: Array<{ riskLevel: string }>): number {
  if (clauses.length === 0) return 0
  
  const weights = { high: 1, medium: 0.6, low: 0.3, positive: -0.2 }
  const totalWeight = clauses.reduce((sum, clause) => {
    return sum + (weights[clause.riskLevel as keyof typeof weights] || 0)
  }, 0)
  
  return Math.max(0, Math.min(1, totalWeight / clauses.length))
}
