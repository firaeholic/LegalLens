import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FileText, Upload, X, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import Layout, { PageWrapper, Section } from '../components/Layout'
import { LoadingState, LoadingOverlay } from '../components/LoadingSpinner'
import { useFileUpload } from '../hooks/useFileUpload'
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis'
import { validateFile } from '../lib/validation'
import { logger } from '../lib/utils'
import { APP_CONFIG } from '../config/constants'

export default function UploadPage() {
  const router = useRouter()
  const [showDemo, setShowDemo] = useState(false)
  
  // Custom hooks
  const {
    uploadedFile,
    isDragActive,
    uploadError,
    isProcessing: isFileProcessing,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
    openFileDialog,
    clearFile,
    getFileIcon
  } = useFileUpload()
  
  const {
    analysis,
    loading: isAnalyzing,
    error: analysisError,
    progress,
    analyzeDocument,
    clearAnalysis
  } = useDocumentAnalysis()

  // Handle file analysis
  const handleAnalyze = useCallback(async () => {
    if (!uploadedFile?.file) {
      logger.warn('No file to analyze', {}, 'UploadPage')
      return
    }

    try {
      // Store uploaded file in session storage before analysis
      sessionStorage.setItem(APP_CONFIG.storageKeys.UPLOADED_FILES, JSON.stringify(uploadedFile))
      
      await analyzeDocument(uploadedFile.file)
      // Navigate to analysis page after successful analysis
      router.push('/analyze')
    } catch (error) {
      logger.error('Analysis failed', error, 'UploadPage')
    }
  }, [uploadedFile, analyzeDocument, router])

  // Handle file removal
  const handleRemoveFile = useCallback(() => {
    clearFile()
    clearAnalysis()
  }, [clearFile, clearAnalysis])

  // Auto-analyze when file is uploaded (optional)
  useEffect(() => {
    if (uploadedFile?.file && !isAnalyzing && !analysis) {
      // Uncomment to auto-analyze
      // handleAnalyze()
    }
  }, [uploadedFile?.file, isAnalyzing, analysis])

  const isProcessing = isFileProcessing || isAnalyzing
  const error = uploadError || analysisError
  const supportedFormats = APP_CONFIG.supportedFormats.join(', ')
  const maxSizeMB = Math.round(APP_CONFIG.maxFileSize / (1024 * 1024))

  return (
    <Layout
      title="Upload Documents - LegalLens AI"
      description="Upload your legal documents for AI-powered analysis"
      showHeader={true}
    >
      {isProcessing && (
        <LoadingOverlay
          message="Processing your document..."
          progress={progress}
          onCancel={() => {
            clearFile()
            clearAnalysis()
          }}
        />
      )}
      
      <PageWrapper className="max-w-4xl">
        <Section className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Your Legal Documents
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Upload PDFs or images of legal documents for AI-powered analysis
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: {supportedFormats} • Max size: {maxSizeMB}MB
          </p>
        </Section>

        {/* Upload Area */}
        <Section>
          <div className="card mb-8">
            {!uploadedFile ? (
              <div
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 cursor-pointer
                  ${
                    isDragActive
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                  }
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={APP_CONFIG.supportedFormats.map(f => `.${f}`).join(',')}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-lg text-primary-600 font-medium">
                    Drop your file here...
                  </p>
                ) : (
                  <div>
                    <p className="text-lg text-gray-600 mb-2">
                      Drag & drop your file here, or <span className="text-primary-600 font-medium">browse</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports {supportedFormats} (max {maxSizeMB}MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 mr-3">
                      {getFileIcon(uploadedFile.file.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {uploadedFile.formattedSize} • {uploadedFile.file.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="mb-6">
              <LoadingState
                type="analysis"
                message="Analyzing your document..."
                progress={progress}
              />
            </div>
          )}

          {/* Action Buttons */}
          {uploadedFile && !isAnalyzing && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isProcessing}
                className="btn-primary flex items-center justify-center px-8 py-3 text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Analyze Document
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowDemo(true)}
                className="btn-secondary px-8 py-3 text-lg"
              >
                View Demo
              </button>
            </div>
          )}

          {/* Demo Section */}
          {showDemo && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🎯 Try Our Demo
              </h3>
              <p className="text-blue-800 mb-4">
                See LegalLens AI in action with a sample contract analysis.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/demo"
                  className="btn-primary"
                >
                  Launch Demo
                </Link>
                <button
                  onClick={() => setShowDemo(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
           )}
         </Section>
       </PageWrapper>
     </Layout>
   )
 }