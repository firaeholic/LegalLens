// Configuration constants for LegalLens AI
import type { AppConfig, RiskLevel } from '../types'

export const APP_CONFIG: AppConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['pdf', 'png', 'jpg', 'jpeg', 'webp'],
  apiTimeouts: {
    OCR: 30000,
    SUMMARIZE: 20000,
    ANALYZE: 25000,
    CHAT: 15000,
    VISUALIZE: 20000
  },
  storageKeys: {
    UPLOADED_FILES: 'legallens_uploaded_files',
    ANALYSIS_RESULTS: 'legallens_analysis_results',
    CHAT_HISTORY: 'legallens_chat_history',
    USER_PREFERENCES: 'legallens_user_preferences'
  },
  riskThresholds: {
    high: 0.7,
    medium: 0.4,
    low: 0.2,
    positive: 0
  },
  debounceDelays: {
    SEARCH: 300,
    INPUT: 150,
    RESIZE: 100
  }
} as const

export const API_ENDPOINTS = {
  OCR: '/ocr',
  SUMMARIZE: '/summarize',
  ANALYZE: '/analyze',
  CHAT: '/chat',
  VISUALIZE: '/visualize'
} as const

export const ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  OCR_FAILED: 'OCR_FAILED',
  SUMMARIZATION_FAILED: 'SUMMARIZATION_FAILED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  CHAT_FAILED: 'CHAT_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  API_TIMEOUT: 'API_TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED'
} as const

export const ERROR_MESSAGES = {
  [ERROR_CODES.FILE_TOO_LARGE]: 'File size exceeds the maximum limit of 10MB',
  [ERROR_CODES.UNSUPPORTED_FORMAT]: 'File format not supported. Please use PDF, PNG, JPG, JPEG, or WEBP',
  [ERROR_CODES.OCR_FAILED]: 'Failed to extract text from the document',
  [ERROR_CODES.SUMMARIZATION_FAILED]: 'Failed to generate document summary',
  [ERROR_CODES.ANALYSIS_FAILED]: 'Failed to analyze document for risks',
  [ERROR_CODES.CHAT_FAILED]: 'Failed to process your question',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error occurred. Please check your connection',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.API_TIMEOUT]: 'Request timed out. Please try again',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please wait before trying again'
} as const

export const RISK_COLORS = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800'
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800'
  },
  positive: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800'
  }
} as const

export const CLAUSE_CATEGORIES = {
  FINANCIAL: 'Financial Terms',
  TERMINATION: 'Termination',
  LIABILITY: 'Liability & Risk',
  INTELLECTUAL_PROPERTY: 'Intellectual Property',
  CONFIDENTIALITY: 'Confidentiality',
  OBLIGATIONS: 'Obligations',
  WARRANTIES: 'Warranties',
  DISPUTE_RESOLUTION: 'Dispute Resolution',
  GOVERNING_LAW: 'Legal Framework',
  BENEFITS: 'Benefits & Rights',
  GENERAL: 'General'
} as const

export const SUGGESTED_QUESTIONS = [
  'What are the key risks in this document?',
  'Who are the parties involved in this agreement?',
  'What are the payment terms?',
  'How can this agreement be terminated?',
  'What are my obligations under this contract?',
  'Are there any liability limitations?',
  'What happens if there is a breach?',
  'What are the warranty terms?',
  'How are disputes resolved?',
  'What is the governing law?'
] as const

export const PROCESSING_STEPS = [
  { id: 'upload', label: 'File Upload', description: 'Uploading and validating file' },
  { id: 'ocr', label: 'Text Extraction', description: 'Extracting text using OCR' },
  { id: 'summarize', label: 'Summarization', description: 'Generating document summary' },
  { id: 'analyze', label: 'Risk Analysis', description: 'Analyzing clauses and risks' },
  { id: 'visualize', label: 'Visualization', description: 'Creating flow visualization' },
  { id: 'complete', label: 'Complete', description: 'Analysis complete' }
] as const

export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  success: '#10B981',
  muted: '#6B7280'
} as const

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500
} as const

export const DEBOUNCE_DELAYS = {
  search: 300,
  input: 500,
  resize: 100
} as const