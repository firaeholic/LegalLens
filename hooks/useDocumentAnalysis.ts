// Custom hook for document analysis
import { useState, useCallback, useRef } from 'react'
import type { DocumentAnalysis, UploadedFile, UseDocumentAnalysisReturn } from '../types'
import { apiClient } from '../lib/apiClient'
import { logger, generateId, calculateRiskScore, storage } from '../lib/utils'
import { APP_CONFIG } from '../config/constants'

export function useDocumentAnalysis(): UseDocumentAnalysisReturn {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const analyzeDocument = useCallback(async (file: File) => {
    // Reset state
    setLoading(true)
    setError(null)
    setProgress(0)
    setAnalysis(null)

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    const startTime = Date.now()
    const analysisId = generateId()

    try {
      logger.info('Starting document analysis', {
        fileName: file.name,
        fileSize: file.size,
        analysisId
      }, 'useDocumentAnalysis')

      // Step 1: OCR Text Extraction (25%)
      setProgress(10)
      const ocrResult = await apiClient.extractText(file)
      setProgress(25)

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Analysis cancelled')
      }

      // Step 2: Text Summarization (50%)
      setProgress(30)
      const summaryResult = await apiClient.summarizeText(ocrResult.text)
      setProgress(50)

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Analysis cancelled')
      }

      // Step 3: Risk Analysis (75%)
      setProgress(55)
      const analysisResult = await apiClient.analyzeText(ocrResult.text)
      setProgress(75)

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Analysis cancelled')
      }

      // Step 4: Generate Visualization Data (90%)
      setProgress(80)
      let visualizationData = null
      try {
        visualizationData = await apiClient.generateVisualization(ocrResult.text, analysisResult)
      } catch (vizError) {
        logger.warn('Visualization generation failed, continuing without it', vizError, 'useDocumentAnalysis')
      }
      setProgress(90)

      // Step 5: Compile Results (100%)
      const processingTime = Date.now() - startTime
      const riskScore = calculateRiskScore(analysisResult.clauses)

      const documentAnalysis: DocumentAnalysis = {
        id: analysisId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        extractedText: ocrResult.text,
        summary: summaryResult.summary,
        riskScore,
        clauses: analysisResult.clauses.map((clause, index) => ({
          id: `clause_${index + 1}`,
          text: clause.text,
          type: clause.type,
          riskLevel: clause.riskLevel,
          explanation: clause.explanation,
          category: clause.category || 'General',
          startIndex: clause.startIndex || 0,
          endIndex: clause.endIndex || clause.text.length,
          confidence: clause.confidence || 0.8
        })),
        timestamp: new Date(),
        processingTime
      }

      setProgress(100)
      setAnalysis(documentAnalysis)

      // Store in session storage
      storage.set(APP_CONFIG.storageKeys.ANALYSIS_RESULTS, documentAnalysis)

      logger.info('Document analysis completed', {
        analysisId,
        processingTime,
        riskScore,
        clausesCount: documentAnalysis.clauses.length,
        textLength: ocrResult.text.length
      }, 'useDocumentAnalysis')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      setProgress(0)
      
      logger.error('Document analysis failed', err, 'useDocumentAnalysis')
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    // Cancel ongoing analysis if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setAnalysis(null)
    setError(null)
    setProgress(0)
    setLoading(false)

    // Clear from storage
    storage.remove(APP_CONFIG.storageKeys.ANALYSIS_RESULTS)

    logger.info('Analysis cleared', {}, 'useDocumentAnalysis')
  }, [])

  const exportAnalysis = useCallback(() => {
    if (!analysis) {
      logger.warn('No analysis to export', {}, 'useDocumentAnalysis')
      return
    }

    try {
      const exportData = {
        ...analysis,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `legallens-analysis-${analysis.fileName}-${new Date().toISOString().split('T')[0]}.json`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)

      logger.info('Analysis exported', {
        fileName: analysis.fileName,
        analysisId: analysis.id
      }, 'useDocumentAnalysis')

    } catch (err) {
      logger.error('Failed to export analysis', err, 'useDocumentAnalysis')
      setError('Failed to export analysis')
    }
  }, [analysis])

  // Load analysis from storage on mount
  const loadStoredAnalysis = useCallback(() => {
    const storedAnalysis = storage.get<DocumentAnalysis>(APP_CONFIG.storageKeys.ANALYSIS_RESULTS)
    if (storedAnalysis) {
      setAnalysis(storedAnalysis)
      logger.info('Loaded analysis from storage', {
        analysisId: storedAnalysis.id,
        fileName: storedAnalysis.fileName
      }, 'useDocumentAnalysis')
    }
  }, [])

  return {
    analysis,
    loading,
    error,
    progress,
    analyzeDocument,
    clearAnalysis,
    exportAnalysis,
    loadStoredAnalysis
  } as UseDocumentAnalysisReturn & { loadStoredAnalysis: () => void }
}