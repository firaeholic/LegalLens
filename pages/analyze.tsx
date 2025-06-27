import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FileText, Download, MessageSquare, AlertTriangle, CheckCircle, Eye, Brain, Shield } from 'lucide-react'
import PDFViewer from '@/components/PDFViewer'
import ChatWithDoc from '@/components/ChatWithDoc'
import ClauseSummary from '@/components/ClauseSummary'
import FlowVisualizer from '@/components/FlowVisualizer'

interface FileData {
  name: string
  type: string
  size: number
  data: string
}

interface AnalysisResult {
  extractedText: string
  summary: string
  clauses: Array<{
    text: string
    type: 'risk' | 'neutral' | 'positive'
    riskLevel: 'high' | 'medium' | 'low'
    explanation: string
  }>
  riskScore: number
}

export default function AnalyzePage() {
  const router = useRouter()
  const [files, setFiles] = useState<FileData[]>([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'document' | 'summary' | 'chat' | 'flow'>('document')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedFiles = sessionStorage.getItem('uploadedFiles')
    if (!storedFiles) {
      router.push('/upload')
      return
    }

    try {
      const parsedFiles = JSON.parse(storedFiles)
      setFiles(parsedFiles)
      if (parsedFiles.length > 0) {
        analyzeDocument(parsedFiles[0])
      }
    } catch (err) {
      setError('Failed to load uploaded files')
    }
  }, [])

  const analyzeDocument = async (file: FileData) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      // Step 1: OCR Extraction
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file })
      })

      if (!ocrResponse.ok) {
        throw new Error('OCR processing failed')
      }

      const { extractedText } = await ocrResponse.json()

      // Step 2: Summarization
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText })
      })

      if (!summaryResponse.ok) {
        throw new Error('Summarization failed')
      }

      const { summary } = await summaryResponse.json()

      // Step 3: Risk Analysis
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText })
      })

      if (!analysisResponse.ok) {
        throw new Error('Risk analysis failed')
      }

      const { clauses, riskScore } = await analysisResponse.json()

      const result: AnalysisResult = {
        extractedText,
        summary,
        clauses,
        riskScore
      }

      setAnalysisResult(result)
      
      // Store in sessionStorage for chat context
      sessionStorage.setItem('analysisResult', JSON.stringify(result))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const switchFile = (index: number) => {
    setCurrentFileIndex(index)
    setAnalysisResult(null)
    analyzeDocument(files[index])
  }

  const downloadResults = () => {
    if (!analysisResult) return

    const results = {
      fileName: files[currentFileIndex]?.name,
      timestamp: new Date().toISOString(),
      ...analysisResult
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `legallens-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-danger-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-success-600'
  }

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk'
    if (score >= 40) return 'Medium Risk'
    return 'Low Risk'
  }

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h2>
          <p className="text-gray-600 mb-4">Please upload documents to analyze</p>
          <Link href="/upload" className="btn-primary">
            Upload Documents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center">
              <FileText className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LegalLens AI</span>
            </Link>
            <div className="flex items-center space-x-4">
              {analysisResult && (
                <button onClick={downloadResults} className="btn-secondary flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </button>
              )}
              <Link href="/upload" className="btn-primary">
                New Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* File Selector */}
        {files.length > 1 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Document</h3>
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <button
                  key={index}
                  onClick={() => switchFile(index)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    index === currentFileIndex
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Status */}
        {isAnalyzing && (
          <div className="card mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-4"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analyzing Document...</h3>
                <p className="text-gray-600">Processing OCR, summarization, and risk analysis</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-danger-600 mr-3" />
            <span className="text-danger-800">{error}</span>
          </div>
        )}

        {/* Risk Score Overview */}
        {analysisResult && (
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analysis Complete</h3>
                <p className="text-gray-600">Document processed successfully</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getRiskColor(analysisResult.riskScore)}`}>
                  {analysisResult.riskScore}%
                </div>
                <div className={`text-sm font-medium ${getRiskColor(analysisResult.riskScore)}`}>
                  {getRiskLabel(analysisResult.riskScore)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {analysisResult && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'document', label: 'Document', icon: Eye },
                  { id: 'summary', label: 'Summary & Risks', icon: Brain },
                  { id: 'chat', label: 'Chat', icon: MessageSquare },
                  { id: 'flow', label: 'Visualization', icon: Shield }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {analysisResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeTab === 'document' && (
              <>
                <div className="lg:col-span-2">
                  <PDFViewer file={files[currentFileIndex]} />
                </div>
                <div className="space-y-4">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Extracted Text</h3>
                    <div className="max-h-96 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
                      {analysisResult.extractedText}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'summary' && (
              <div className="lg:col-span-3">
                <ClauseSummary 
                  summary={analysisResult.summary}
                  clauses={analysisResult.clauses}
                  riskScore={analysisResult.riskScore}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="lg:col-span-3">
                <ChatWithDoc />
              </div>
            )}

            {activeTab === 'flow' && (
              <div className="lg:col-span-3">
                <FlowVisualizer clauses={analysisResult.clauses} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}