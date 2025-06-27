import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { FileText, Upload, X, AlertCircle, CheckCircle } from 'lucide-react'

interface UploadedFile {
  file: File
  preview?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      const errors = rejectedFiles.map(rejection => 
        rejection.errors.map(error => error.message).join(', ')
      ).join('; ')
      setError(`Upload failed: ${errors}`)
    }
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const processDocuments = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one document')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Store files in sessionStorage for the analyze page
      const fileData = await Promise.all(
        uploadedFiles.map(async ({ file }) => {
          const arrayBuffer = await file.arrayBuffer()
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64
          }
        })
      )

      sessionStorage.setItem('uploadedFiles', JSON.stringify(fileData))
      router.push('/analyze')
    } catch (err) {
      setError('Failed to process files. Please try again.')
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center">
              <FileText className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LegalLens AI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Your Legal Documents
          </h1>
          <p className="text-lg text-gray-600">
            Upload PDFs or images of legal documents for AI-powered analysis
          </p>
        </div>

        {/* Upload Area */}
        <div className="card mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg text-primary-600 font-medium">
                Drop your files here...
              </p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Drag & drop your files here, or <span className="text-primary-600 font-medium">browse</span>
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, PNG, JPG, JPEG, GIF, BMP, TIFF (max 10MB each)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-danger-600 mr-3" />
            <span className="text-danger-800">{error}</span>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-10 h-10 object-cover rounded mr-3"
                      />
                    ) : (
                      <FileText className="w-10 h-10 text-red-600 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadedFile.file.size)} • {uploadedFile.file.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Button */}
        <div className="text-center">
          <button
            onClick={processDocuments}
            disabled={uploadedFiles.length === 0 || isProcessing}
            className={`btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed ${
              isProcessing ? 'animate-pulse' : ''
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Analyze Documents
              </div>
            )}
          </button>
          {uploadedFiles.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Upload at least one document to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}