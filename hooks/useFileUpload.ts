// Custom hook for file upload functionality
import { useState, useCallback, useRef } from 'react'
import type { UploadedFile, UseFileUploadReturn } from '../types'
import { logger, fileToBase64, formatFileSize } from '../lib/utils'
import { validateFile } from '../lib/validation'
import { APP_CONFIG } from '../config/constants'

export function useFileUpload(): UseFileUploadReturn {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File): Promise<UploadedFile> => {
    setIsProcessing(true)
    setUploadError(null)

    try {
      // Enhanced file validation with detailed logging
      logger.info('Starting file validation', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: file.lastModified
      }, 'useFileUpload')
      
      const validation = validateFile(file)
      if (!validation.isValid) {
        const errorMessage = validation.error || 'Invalid file type or format'
        logger.error('File validation failed', {
          fileName: file.name,
          fileType: file.type,
          error: errorMessage,
          warnings: validation.warnings
        }, 'useFileUpload')
        throw new Error(errorMessage)
      }
      
      if (validation.warnings && validation.warnings.length > 0) {
        logger.warn('File validation warnings', {
          fileName: file.name,
          warnings: validation.warnings
        }, 'useFileUpload')
      }

      logger.info('Processing uploaded file', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }, 'useFileUpload')

      // Convert to base64 for processing
      const base64 = await fileToBase64(file)
      
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        file,
        preview: file.name,
        status: file.type === 'text/plain' ? 'completed' : 'pending',
        formattedSize: formatFileSize(file.size),
        type: file.type,
        base64
      }

      setUploadedFile(uploadedFile)
      
      logger.info('File processed successfully', {
        fileName: file.name,
        base64Length: base64.length
      }, 'useFileUpload')

      return uploadedFile

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file'
      setUploadError(errorMessage)
      logger.error('File processing failed', error, 'useFileUpload')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    if (fileArray.length === 0) {
      return
    }

    if (fileArray.length > 1) {
      setUploadError('Please select only one file at a time')
      return
    }

    const file = fileArray[0]
    
    try {
      await processFile(file)
    } catch (error) {
      // Error is already handled in processFile
    }
  }, [processFile])

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const files = e.dataTransfer.files
    await handleFileSelect(files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      await handleFileSelect(files)
    }
  }, [handleFileSelect])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const clearFile = useCallback(() => {
    setUploadedFile(null)
    setUploadError(null)
    setIsProcessing(false)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    logger.info('File cleared', {}, 'useFileUpload')
  }, [])

  const retryUpload = useCallback(async () => {
    if (uploadedFile?.file) {
      try {
        await processFile(uploadedFile.file)
      } catch (error) {
        // Error is already handled in processFile
      }
    }
  }, [uploadedFile?.file, processFile])

  // Get file preview URL for images
  const getPreviewUrl = useCallback(() => {
    if (!uploadedFile?.file) return null
    
    if (uploadedFile.file.type.startsWith('image/')) {
      return URL.createObjectURL(uploadedFile.file)
    }
    
    return null
  }, [uploadedFile?.file])

  // Get file icon based on type
  const getFileIcon = useCallback((fileType?: string) => {
    const type = fileType || uploadedFile?.file?.type
    if (!type) return 'file'
    
    if (type === 'text/plain') return 'file-text'
    if (type.startsWith('image/')) return 'image'
    if (type.includes('word')) return 'file-text'
    if (type.includes('text')) return 'file-text'
    
    return 'file'
  }, [uploadedFile?.file?.type])

  // Check if file type is supported
  const isFileTypeSupported = useCallback((file: File) => {
    return APP_CONFIG.supportedFormats.some(format => {
      if (format.startsWith('.')) {
        return file.name.toLowerCase().endsWith(format.toLowerCase())
      }
      return file.type === format
    })
  }, [])

  // Get upload progress (for future enhancement)
  const getUploadProgress = useCallback(() => {
    if (isProcessing) return 50 // Simulated progress
    if (uploadedFile) return 100
    return 0
  }, [isProcessing, uploadedFile])


  return {
    // Legacy interface for backward compatibility
    file: uploadedFile,
    isDragActive,
    uploadError,
    isProcessing,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    openFileDialog,
    clearFile,
    getFileIcon,
    retryUpload,
    getPreviewUrl,
    isFileTypeSupported,
    getUploadProgress,
    
    // New interface properties
    files: uploadedFile ? [uploadedFile] : [],
    uploadFile: processFile,
    removeFile: (id: string) => {
      if (uploadedFile?.id === id) {
        clearFile();
      }
    },
    clearFiles: clearFile,
    validateFile: (file: File) => {
      const validation = validateFile(file);
      return {
        valid: validation.isValid,
        error: validation.error || undefined
      };
    },
  }
}