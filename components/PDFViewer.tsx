import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  file: {
    name: string
    type: string
    data: string
  }
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (file.type === 'application/pdf') {
      // Convert base64 to data URL for PDF
      setPdfData(`data:application/pdf;base64,${file.data}`)
    } else {
      setPdfData(null)
    }
    setError(null)
    setPageNumber(1)
    setScale(1.0)
  }, [file])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    setError('Failed to load PDF document')
    console.error('PDF load error:', error)
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  // Handle non-PDF files (images)
  if (file.type !== 'application/pdf') {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {file.name}
          </h3>
          <div className="flex items-center space-x-2">
            <button onClick={zoomOut} className="p-2 text-gray-600 hover:text-gray-900">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-2 text-gray-600 hover:text-gray-900">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="border rounded-lg overflow-auto max-h-96">
          <img
            src={`data:${file.type};base64,${file.data}`}
            alt={file.name}
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            className="max-w-full h-auto"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          {file.name}
        </h3>
        <div className="flex items-center space-x-2">
          <button onClick={zoomOut} className="p-2 text-gray-600 hover:text-gray-900">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-2 text-gray-600 hover:text-gray-900">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-gray-500 text-sm">Unable to display PDF. The document is still being processed for text extraction.</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-auto" style={{ maxHeight: '600px' }}>
            {pdfData && (
              <Document
                file={pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-gray-600">Loading PDF...</span>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  loading={
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  }
                />
              </Document>
            )}
          </div>

          {numPages > 0 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {numPages}
              </span>
              
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}