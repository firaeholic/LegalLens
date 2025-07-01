// Shared TypeScript interfaces and types for LegalLens AI

export type RiskLevel = 'high' | 'medium' | 'low' | 'positive'
export type ClauseType = 'financial' | 'termination' | 'liability' | 'intellectual_property' | 'confidentiality' | 'obligation' | 'warranty' | 'dispute_resolution' | 'governing_law' | 'benefit' | 'general'

export interface DocumentAnalysis {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  extractedText: string
  summary: string
  riskScore: number
  clauses: Clause[]
  timestamp: Date
  processingTime: number
}

export interface Clause {
  id: string
  text: string
  type: ClauseType
  riskLevel: RiskLevel
  explanation: string
  category: string
  startIndex: number
  endIndex: number
  confidence: number
}

export interface OCRResult {
  text: string
  confidence: number
  processingTime: number
  method: 'ai' | 'fallback'
}

export interface SummaryResult {
  summary: string
  keyPoints: string[]
  wordCount: number
  compressionRatio: number
  method: 'ai' | 'extractive'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  sources?: string[]
  isError?: boolean
  context?: string
}

export interface ChatResponse {
  answer: string
  confidence: number
  sources: string[]
  suggestedQuestions: string[]
}

export interface APIError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

export interface UploadedFile {
  id: string
  file: File
  preview?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface AnalysisState {
  files: UploadedFile[]
  currentFileId: string | null
  analysis: DocumentAnalysis | null
  loading: boolean
  error: string | null
  progress: number
}

export interface FlowVisualizationData {
  nodes: ClauseNode[]
  relationships: ClauseRelationship[]
  summary: FlowSummary
}

export interface ClauseNode {
  id: string
  text: string
  type: ClauseType
  riskLevel: RiskLevel
  category: string
  connections: string[]
  position?: { x: number; y: number }
}

export interface ClauseRelationship {
  from: string
  to: string
  type: 'sequential' | 'conditional' | 'reference' | 'conflict' | 'category' | 'dependency'
  description: string
  strength: number
}

export interface FlowSummary {
  totalClauses: number
  riskDistribution: Record<RiskLevel, number>
  categories: string[]
  relationshipTypes: Record<string, number>
}

// API Response types
export interface APIResponse<T> {
  data?: T
  error?: APIError
  success: boolean
  timestamp: Date
}

// Configuration types
export interface AppConfig {
  maxFileSize: number
  supportedFormats: string[]
  apiTimeouts: Record<string, number>
  storageKeys: Record<string, string>
  riskThresholds: Record<RiskLevel, number>
  debounceDelays: Record<string, number>
}

// Hook return types
export interface UseDocumentAnalysisReturn {
  analysis: DocumentAnalysis | null
  loading: boolean
  error: string | null
  progress: number
  analyzeDocument: (file: File) => Promise<void>
  clearAnalysis: () => void
  exportAnalysis: () => void
}

export interface UseFileUploadReturn {
  files: UploadedFile[]
  uploadFile: (file: File) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  validateFile: (file: File) => { valid: boolean; error?: string }
}

export interface UseChatReturn {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
  clearChat: () => void
  suggestedQuestions: string[]
}