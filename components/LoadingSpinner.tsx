// Loading spinner component with different states and animations
import React from 'react'
import { Loader2, FileText, Search, MessageSquare, BarChart3 } from 'lucide-react'
import { cn } from '../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'pulse' | 'dots' | 'bars'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  className?: string
}

interface LoadingStateProps {
  type?: 'upload' | 'ocr' | 'analysis' | 'chat' | 'visualization' | 'general'
  message?: string
  progress?: number
  className?: string
}

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  progress?: number
  onCancel?: () => void
  className?: string
}

// Basic loading spinner
export function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner', 
  color = 'primary',
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  }

  if (variant === 'spinner') {
    return (
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          colorClasses[color],
          className
        )} 
      />
    )
  }

  if (variant === 'pulse') {
    return (
      <div 
        className={cn(
          'rounded-full animate-pulse bg-current',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
      />
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-current animate-bounce',
              size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-4 w-4',
              colorClasses[color]
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-current animate-pulse',
              size === 'sm' ? 'h-3 w-1' : size === 'md' ? 'h-4 w-1' : size === 'lg' ? 'h-6 w-1' : 'h-8 w-1',
              colorClasses[color]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.2s'
            }}
          />
        ))}
      </div>
    )
  }

  return null
}

// Loading state with context-specific icons and messages
export function LoadingState({ 
  type = 'general', 
  message, 
  progress,
  className 
}: LoadingStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'upload':
        return <FileText className="h-8 w-8 text-blue-600" />
      case 'ocr':
        return <Search className="h-8 w-8 text-green-600" />
      case 'analysis':
        return <BarChart3 className="h-8 w-8 text-purple-600" />
      case 'chat':
        return <MessageSquare className="h-8 w-8 text-indigo-600" />
      case 'visualization':
        return <BarChart3 className="h-8 w-8 text-orange-600" />
      default:
        return <LoadingSpinner size="lg" />
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'upload':
        return 'Processing your document...'
      case 'ocr':
        return 'Extracting text from document...'
      case 'analysis':
        return 'Analyzing document content...'
      case 'chat':
        return 'Generating response...'
      case 'visualization':
        return 'Creating visualization...'
      default:
        return 'Loading...'
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="mb-4 relative">
        {getIcon()}
        <div className="absolute -bottom-1 -right-1">
          <LoadingSpinner size="sm" variant="spinner" />
        </div>
      </div>
      
      <p className="text-lg font-medium text-gray-900 mb-2">
        {message || getDefaultMessage()}
      </p>
      
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
      
      <p className="text-sm text-gray-500 mt-2">
        This may take a few moments...
      </p>
    </div>
  )
}

// Full-screen loading overlay
export function LoadingOverlay({ 
  isVisible, 
  message, 
  progress, 
  onCancel,
  className 
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className={cn(
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <LoadingState 
          message={message}
          progress={progress}
          className="py-4"
        />
        
        {onCancel && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Skeleton loader for content placeholders
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  )
}

// Button loading state
export function LoadingButton({ 
  isLoading, 
  children, 
  disabled,
  className,
  ...props 
}: {
  isLoading: boolean
  children: React.ReactNode
  disabled?: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center',
        isLoading && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="secondary" />
        </div>
      )}
      <span className={cn(isLoading && 'opacity-0')}>
        {children}
      </span>
    </button>
  )
}

export default LoadingSpinner