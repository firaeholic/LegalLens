// API Client for LegalLens AI
import type { APIResponse, OCRResult, SummaryResult, ChatResponse, FlowVisualizationData } from '../types'
import { AppError, logger, retry } from './utils'
import { API_ENDPOINTS, ERROR_CODES, APP_CONFIG } from '../config/constants'

class APIClient {
  private baseURL = '/api'
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = 30000
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        
        throw new AppError(
          this.getErrorCode(response.status),
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, response: errorData }
        )
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new AppError(
          ERROR_CODES.API_TIMEOUT,
          data.error,
          data
        )
      }
      
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof AppError) {
        throw error
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new AppError(ERROR_CODES.API_TIMEOUT, 'Request timed out')
        }
        
        if (error.message.includes('fetch')) {
          throw new AppError(ERROR_CODES.NETWORK_ERROR, 'Network error occurred')
        }
      }
      
      throw new AppError(
        ERROR_CODES.NETWORK_ERROR,
        'An unexpected error occurred',
        error
      )
    }
  }
  
  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return ERROR_CODES.INVALID_INPUT
      case 408:
        return ERROR_CODES.API_TIMEOUT
      case 413:
        return ERROR_CODES.FILE_TOO_LARGE
      case 415:
        return ERROR_CODES.UNSUPPORTED_FORMAT
      case 429:
        return ERROR_CODES.RATE_LIMITED
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_CODES.NETWORK_ERROR
      default:
        return ERROR_CODES.NETWORK_ERROR
    }
  }
  
  // OCR API
  async extractText(file: File): Promise<OCRResult> {
    logger.info('Starting OCR extraction', { fileName: file.name, fileSize: file.size }, 'apiClient.extractText')
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const result = await retry(
        () => this.request<OCRResult>(API_ENDPOINTS.OCR, {
          method: 'POST',
          body: formData,
          headers: {} // Remove Content-Type to let browser set it for FormData
        }, APP_CONFIG.apiTimeouts.OCR),
        2, // Max 2 retries for OCR
        2000 // 2 second delay
      )
      
      logger.info('OCR extraction completed', {
        textLength: result.text.length,
        confidence: result.confidence,
        method: result.method
      }, 'apiClient.extractText')
      
      return result
    } catch (error) {
      logger.error('OCR extraction failed', error, 'apiClient.extractText')
      throw error instanceof AppError ? error : new AppError(ERROR_CODES.OCR_FAILED, 'Failed to extract text')
    }
  }
  
  // Summarization API
  async summarizeText(text: string): Promise<SummaryResult> {
    logger.info('Starting text summarization', { textLength: text.length }, 'apiClient.summarizeText')
    
    try {
      const result = await retry(
        () => this.request<SummaryResult>(API_ENDPOINTS.SUMMARIZE, {
          method: 'POST',
          body: JSON.stringify({ text })
        }, APP_CONFIG.apiTimeouts.SUMMARIZE),
        2,
        1500
      )
      
      logger.info('Text summarization completed', {
        summaryLength: result.summary.length,
        keyPointsCount: result.keyPoints.length,
        compressionRatio: result.compressionRatio
      }, 'apiClient.summarizeText')
      
      return result
    } catch (error) {
      logger.error('Text summarization failed', error, 'apiClient.summarizeText')
      throw error instanceof AppError ? error : new AppError(ERROR_CODES.SUMMARIZATION_FAILED, 'Failed to summarize text')
    }
  }
  
  // Analysis API
  async analyzeText(text: string): Promise<{ clauses: any[], riskScore: number, summary: string }> {
    logger.info('Starting text analysis', { textLength: text.length }, 'apiClient.analyzeText')
    
    try {
      const result = await retry(
        () => this.request<{ clauses: any[], riskScore: number, summary: string }>(API_ENDPOINTS.ANALYZE, {
          method: 'POST',
          body: JSON.stringify({ text })
        }, APP_CONFIG.apiTimeouts.ANALYZE),
        2,
        1500
      )
      
      logger.info('Text analysis completed', {
        clausesCount: result.clauses.length,
        riskScore: result.riskScore
      }, 'apiClient.analyzeText')
      
      return result
    } catch (error) {
      logger.error('Text analysis failed', error, 'apiClient.analyzeText')
      throw error instanceof AppError ? error : new AppError(ERROR_CODES.ANALYSIS_FAILED, 'Failed to analyze text')
    }
  }
  
  // Chat API
  async chatWithDocument(question: string, context: string): Promise<ChatResponse> {
    logger.info('Starting chat request', { questionLength: question.length, contextLength: context.length }, 'apiClient.chatWithDocument')
    
    try {
      const result = await this.request<{ answer: string }>(API_ENDPOINTS.CHAT, {
        method: 'POST',
        body: JSON.stringify({ question, context })
      }, APP_CONFIG.apiTimeouts.CHAT)
      
      // Transform the response to match ChatResponse interface
      const chatResponse: ChatResponse = {
        answer: result.answer,
        confidence: 0.8, // Default confidence since API doesn't return it
        sources: [], // Could be enhanced to return sources
        suggestedQuestions: [] // Could be enhanced to return suggestions
      }
      
      logger.info('Chat request completed', {
        answerLength: chatResponse.answer.length,
        confidence: chatResponse.confidence
      }, 'apiClient.chatWithDocument')
      
      return chatResponse
    } catch (error) {
      logger.error('Chat request failed', error, 'apiClient.chatWithDocument')
      throw error instanceof AppError ? error : new AppError(ERROR_CODES.CHAT_FAILED, 'Failed to process chat request')
    }
  }
  
  // Visualization API
  async generateVisualization(text: string, analysisResults?: any): Promise<FlowVisualizationData> {
    logger.info('Starting visualization generation', { textLength: text.length }, 'apiClient.generateVisualization')
    
    try {
      const result = await this.request<{ flowData: FlowVisualizationData }>(API_ENDPOINTS.VISUALIZE, {
        method: 'POST',
        body: JSON.stringify({ text, analysisResults })
      }, APP_CONFIG.apiTimeouts.VISUALIZE)
      
      logger.info('Visualization generation completed', {
        nodesCount: result.flowData.nodes.length,
        relationshipsCount: result.flowData.relationships.length
      }, 'apiClient.generateVisualization')
      
      return result.flowData
    } catch (error) {
      logger.error('Visualization generation failed', error, 'apiClient.generateVisualization')
      throw error instanceof AppError ? error : new AppError(ERROR_CODES.ANALYSIS_FAILED, 'Failed to generate visualization')
    }
  }
  
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      const result = await this.request<{ status: string }>('/health', {
        method: 'GET'
      }, 5000)
      
      return {
        status: result.status || 'ok',
        timestamp: new Date()
      }
    } catch (error) {
      logger.warn('Health check failed', error, 'apiClient.healthCheck')
      return {
        status: 'error',
        timestamp: new Date()
      }
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient()

// Export class for testing
export { APIClient }