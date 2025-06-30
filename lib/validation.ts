// Input validation utilities
import { APP_CONFIG } from '../config/constants'
import type { RiskLevel, ClauseType } from '../types'

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

// File validation
export function validateFile(file: File): ValidationResult {
  const warnings: string[] = []

  // Check file size
  if (file.size > APP_CONFIG.maxFileSize) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(APP_CONFIG.maxFileSize)})`
    }
  }

  // Check file type with comprehensive validation
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()
  
  // Define comprehensive MIME type mappings
  const validMimeTypes = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ])
  
  // Define valid file extensions
  const validExtensions = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp'])
  
  // Check by MIME type first
  const isValidMimeType = validMimeTypes.has(fileType)
  
  // Check by file extension as fallback
  const hasValidExtension = Array.from(validExtensions).some(ext => fileName.endsWith(ext))
  
  // Additional check for common PNG variations
  const isPngFile = fileType.includes('png') || fileName.endsWith('.png')
  const isJpegFile = (fileType.includes('jpeg') || fileType.includes('jpg')) || 
                    (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg'))
  const isPdfFile = fileType.includes('pdf') || fileName.endsWith('.pdf')
  const isWebpFile = fileType.includes('webp') || fileName.endsWith('.webp')
  
  const isValidType = isValidMimeType || hasValidExtension || isPngFile || isJpegFile || isPdfFile || isWebpFile

  if (!isValidType) {
    return {
      isValid: false,
      error: `File type "${file.type || 'unknown'}" is not supported. Supported formats: ${APP_CONFIG.supportedFormats.join(', ')}`
    }
  }

  // Check file name
  if (file.name.length > 255) {
    warnings.push('File name is very long and may cause issues')
  }

  // Check for potentially problematic characters
  const problematicChars = /[<>:"|?*\x00-\x1f]/
  if (problematicChars.test(file.name)) {
    warnings.push('File name contains special characters that may cause issues')
  }

  // Warn about very small files
  if (file.size < 100) {
    warnings.push('File is very small and may not contain meaningful content')
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// Text validation
export function validateText(text: string, options: {
  minLength?: number
  maxLength?: number
  required?: boolean
  allowEmpty?: boolean
} = {}): ValidationResult {
  const {
    minLength = 1,
    maxLength = 1000000, // 1MB of text
    required = true,
    allowEmpty = false
  } = options

  if (required && !text) {
    return {
      isValid: false,
      error: 'Text is required'
    }
  }

  if (!allowEmpty && text.trim().length === 0) {
    return {
      isValid: false,
      error: 'Text cannot be empty'
    }
  }

  if (text.length < minLength) {
    return {
      isValid: false,
      error: `Text must be at least ${minLength} characters long`
    }
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `Text must not exceed ${maxLength} characters`
    }
  }

  const warnings: string[] = []

  // Check for suspicious content
  if (text.includes('<script>') || text.includes('javascript:')) {
    warnings.push('Text contains potentially unsafe content')
  }

  // Check for very repetitive content
  const words = text.split(/\s+/)
  const uniqueWords = new Set(words)
  if (words.length > 100 && uniqueWords.size / words.length < 0.1) {
    warnings.push('Text appears to be very repetitive')
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// API request validation
export function validateApiRequest(data: any, schema: {
  requiredFields: string[]
  optionalFields?: string[]
  maxSize?: number
}): ValidationResult {
  const { requiredFields, optionalFields = [], maxSize = 10 * 1024 * 1024 } = schema

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Request data must be an object'
    }
  }

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in data) || data[field] === undefined || data[field] === null) {
      return {
        isValid: false,
        error: `Required field "${field}" is missing`
      }
    }
  }

  // Check for unexpected fields
  const allowedFields = [...requiredFields, ...optionalFields]
  const unexpectedFields = Object.keys(data).filter(key => !allowedFields.includes(key))
  
  if (unexpectedFields.length > 0) {
    return {
      isValid: false,
      error: `Unexpected fields: ${unexpectedFields.join(', ')}`
    }
  }

  // Check data size
  const dataSize = JSON.stringify(data).length
  if (dataSize > maxSize) {
    return {
      isValid: false,
      error: `Request data size (${formatFileSize(dataSize)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
    }
  }

  return { isValid: true }
}

// Sanitize text input
export function sanitizeText(text: string): string {
  if (!text) return ''

  return text
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim()
    // Remove potentially dangerous HTML/JS
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Validate risk level
export function validateRiskLevel(riskLevel: any): riskLevel is RiskLevel {
  return ['low', 'medium', 'high'].includes(riskLevel)
}

// Validate clause type
export function validateClauseType(clauseType: any): clauseType is ClauseType {
  return [
    'termination',
    'payment',
    'liability',
    'confidentiality',
    'intellectual_property',
    'dispute_resolution',
    'force_majeure',
    'governing_law',
    'amendment',
    'assignment',
    'warranty',
    'indemnification',
    'compliance',
    'data_protection',
    'other'
  ].includes(clauseType)
}

// Validate email format
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return {
      isValid: false,
      error: 'Email is required'
    }
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    }
  }

  if (email.length > 254) {
    return {
      isValid: false,
      error: 'Email is too long'
    }
  }

  return { isValid: true }
}

// Validate URL format
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return {
      isValid: false,
      error: 'URL is required'
    }
  }

  try {
    const urlObj = new URL(url)
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol'
      }
    }

    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format'
    }
  }
}

// Validate JSON string
export function validateJson(jsonString: string): ValidationResult {
  if (!jsonString) {
    return {
      isValid: false,
      error: 'JSON string is required'
    }
  }

  try {
    JSON.parse(jsonString)
    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Validate confidence score
export function validateConfidence(confidence: any): ValidationResult {
  if (typeof confidence !== 'number') {
    return {
      isValid: false,
      error: 'Confidence must be a number'
    }
  }

  if (confidence < 0 || confidence > 1) {
    return {
      isValid: false,
      error: 'Confidence must be between 0 and 1'
    }
  }

  return { isValid: true }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Batch validation for multiple inputs
export function validateBatch(validations: Array<() => ValidationResult>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const validate of validations) {
    const result = validate()
    if (!result.isValid && result.error) {
      errors.push(result.error)
    }
    if (result.warnings) {
      warnings.push(...result.warnings)
    }
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join('; ') : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// Create validation schema
export function createValidationSchema<T>(validators: {
  [K in keyof T]?: (value: T[K]) => ValidationResult
}) {
  return (data: T): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    for (const [key, validator] of Object.entries(validators)) {
      if (validator && key in data) {
        const result = validator((data as any)[key])
        if (!result.isValid && result.error) {
          errors.push(`${key}: ${result.error}`)
        }
        if (result.warnings) {
          warnings.push(...result.warnings.map(w => `${key}: ${w}`))
        }
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }
}