import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FileText, Download, MessageSquare, AlertTriangle, CheckCircle, Eye, Brain, Shield, ArrowLeft, Upload } from 'lucide-react'
import Layout, { PageWrapper, Section } from '../components/Layout'
import { LoadingState, LoadingOverlay } from '../components/LoadingSpinner'
import PDFViewer from '@/components/PDFViewer'
import ChatWithDoc from '@/components/ChatWithDoc'
import ClauseSummary from '@/components/ClauseSummary'
import FlowVisualizer from '@/components/FlowVisualizer'
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis'
import { useChat } from '../hooks/useChat'
import { logger, formatFileSize } from '../lib/utils'
import { APP_CONFIG, RISK_COLORS } from '../config/constants'
import type { DocumentAnalysis, UploadedFile } from '../types'

export default function AnalyzePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'document' | 'summary' | 'chat' | 'flow'>('document')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  
  // Custom hooks
  const {
    analysis,
    loading: isAnalyzing,
    error: analysisError,
    progress,
    analyzeDocument,
    exportAnalysis,
    clearAnalysis,
    loadStoredAnalysis
  } = useDocumentAnalysis()
  
  const {
    messages,
    loading: isChatLoading,
    error: chatError,
    sendMessage,
    clearChat,
    suggestedQuestions
  } = useChat()

  // Load analysis from session storage or redirect to upload
  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem(APP_CONFIG.storageKeys.ANALYSIS_RESULTS)
    const storedFile = sessionStorage.getItem(APP_CONFIG.storageKeys.UPLOADED_FILES)
    
    if (storedAnalysis) {
      try {
        // Load the stored analysis into state
        loadStoredAnalysis()
        logger.info('Loaded existing analysis from storage', {}, 'AnalyzePage')
      } catch (error) {
        logger.error('Failed to parse stored analysis', error, 'AnalyzePage')
        sessionStorage.removeItem(APP_CONFIG.storageKeys.ANALYSIS_RESULTS)
      }
    }
    
    if (storedFile) {
      try {
        const parsedFile = JSON.parse(storedFile)
        setUploadedFile(parsedFile)
        
        // If no analysis exists but we have a file, analyze it
        if (!storedAnalysis && !analysis) {
          const fileBlob = new File([Uint8Array.from(atob(parsedFile.base64), c => c.charCodeAt(0))], parsedFile.name, {
            type: parsedFile.type
          })
          analyzeDocument(fileBlob)
        }
      } catch (error) {
        logger.error('Failed to parse stored file', error, 'AnalyzePage')
        router.push('/upload')
        return
      }
    } else {
      // No file found, redirect to upload
      router.push('/upload')
      return
    }
  }, [router, analysis, analyzeDocument, loadStoredAnalysis])

  // Handle tab switching
  const handleTabSwitch = (tab: typeof activeTab) => {
    setActiveTab(tab)
    logger.info('Tab switched', { tab }, 'AnalyzePage')
  }

  // Handle new analysis
  const handleNewAnalysis = () => {
    clearAnalysis()
    clearChat()
    router.push('/upload')
  }

  // Get risk color based on score
  const getRiskColor = (score: number) => {
    if (score >= APP_CONFIG.riskThresholds.high) return RISK_COLORS.high
    if (score >= APP_CONFIG.riskThresholds.medium) return RISK_COLORS.medium
    return RISK_COLORS.low
  }

  // Get risk level text
  const getRiskLevel = (score: number) => {
    if (score >= APP_CONFIG.riskThresholds.high) return 'High Risk'
    if (score >= APP_CONFIG.riskThresholds.medium) return 'Medium Risk'
    return 'Low Risk'
  }

  const error = analysisError || chatError
   const isLoading = isAnalyzing || isChatLoading
 
   // Show loading or no file state
   if (!uploadedFile && !analysis) {
     return (
       <Layout
         title="Document Analysis - LegalLens AI"
         description="AI-powered legal document analysis"
         showHeader={true}
       >
         <PageWrapper className="flex items-center justify-center min-h-[60vh]">
           <div className="text-center">
             <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
             <h2 className="text-xl font-semibold text-gray-900 mb-2">No document found</h2>
             <p className="text-gray-600 mb-4">Please upload a document to analyze</p>
             <Link href="/upload" className="btn-primary">
               Upload Document
             </Link>
           </div>
         </PageWrapper>
       </Layout>
     )
   }
 
   return (
     <Layout
       title={`Analysis: ${uploadedFile?.preview || 'Document'} - LegalLens AI`}
       description="AI-powered legal document analysis results"
       showHeader={true}
     >
       {isLoading && (
         <LoadingOverlay
           isVisible={isLoading}
           message={isAnalyzing ? 'Analyzing document...' : 'Processing...'}
           progress={progress}
         />
       )}
       
       <PageWrapper>
         {/* Header Section */}
         <Section className="border-b border-gray-200 pb-6">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div className="flex items-center gap-4">
               <Link
                 href="/upload"
                 className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
               >
                 <ArrowLeft className="w-4 h-4 mr-2" />
                 Back to Upload
               </Link>
               
               {uploadedFile && (
                 <div className="flex items-center text-sm text-gray-600">
                   <FileText className="w-4 h-4 mr-2" />
                   <span className="font-medium">{uploadedFile.preview}</span>
                 </div>
               )}
             </div>
             
             <div className="flex items-center gap-3">
               {analysis && (
                 <button
                   onClick={() => exportAnalysis()}
                   className="btn-secondary flex items-center"
                 >
                   <Download className="w-4 h-4 mr-2" />
                   Export Results
                 </button>
               )}
               <button
                 onClick={handleNewAnalysis}
                 className="btn-primary"
               >
                 New Analysis
               </button>
             </div>
           </div>
         </Section>

         {/* Error Message */}
         {error && (
           <Section>
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
               <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
               <span className="text-red-800">{error}</span>
             </div>
           </Section>
         )}

         {/* Analysis Progress */}
         {isAnalyzing && (
           <Section>
             <LoadingState
               type="analysis"
               message="Analyzing your document..."
               progress={progress}
             />
           </Section>
         )}

         {/* Risk Score Overview */}
         {analysis && (
           <Section>
             <div className="card">
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900">Analysis Complete</h3>
                   <p className="text-gray-600">Document processed successfully</p>
                 </div>
                 <div className="text-right">
                   <div className={`text-2xl font-bold ${getRiskColor(analysis.riskScore)}`}>
                     {analysis.riskScore}%
                   </div>
                   <div className={`text-sm font-medium ${getRiskColor(analysis.riskScore)}`}>
                     {getRiskLevel(analysis.riskScore)}
                   </div>
                 </div>
               </div>
             </div>
           </Section>
         )}

         {/* Tab Navigation */}
         {analysis && (
           <Section>
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
                     onClick={() => handleTabSwitch(id as any)}
                     className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
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
           </Section>
         )}

         {/* Tab Content */}
         {analysis && (
           <Section>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {activeTab === 'document' && (
                 <>
                   <div className="lg:col-span-2">
                     <PDFViewer file={uploadedFile ? {
                       name: uploadedFile.preview || '',
                       type: uploadedFile.type || '',
                       data: uploadedFile.base64 || ''
                     } : null} />
                   </div>
                   <div className="space-y-4">
                     <div className="card">
                       <h3 className="text-lg font-semibold text-gray-900 mb-3">Extracted Text</h3>
                       <div className="max-h-96 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
                         {analysis.extractedText || 'No text extracted'}
                       </div>
                     </div>
                   </div>
                 </>
               )}

               {activeTab === 'summary' && (
                 <div className="lg:col-span-3">
                   <ClauseSummary 
                     summary={analysis.summary || ''}
                     clauses={analysis.clauses?.map(clause => ({
                        text: clause.text,
                        type: clause.riskLevel === 'high' ? 'risk' as const : 
                              clause.riskLevel === 'low' ? 'positive' as const : 'neutral' as const,
                        riskLevel: clause.riskLevel === 'positive' ? 'low' : clause.riskLevel as 'high' | 'medium' | 'low',
                        explanation: clause.explanation
                      })) || []}
                     riskScore={analysis.riskScore}
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
                   <FlowVisualizer clauses={analysis.clauses?.map(clause => ({
                      text: clause.text,
                      type: clause.riskLevel === 'high' ? 'risk' as const : 
                            clause.riskLevel === 'low' ? 'positive' as const : 'neutral' as const,
                      riskLevel: clause.riskLevel === 'positive' ? 'low' : clause.riskLevel as 'high' | 'medium' | 'low',
                      explanation: clause.explanation
                    })) || []} />
                 </div>
               )}
             </div>
           </Section>
         )}
       </PageWrapper>
     </Layout>
   )
 }