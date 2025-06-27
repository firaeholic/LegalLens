import { useState } from 'react'
import Link from 'next/link'
import { FileText, Brain, Shield, MessageSquare, Upload, Zap } from 'lucide-react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features = [
    {
      icon: <Upload className="w-8 h-8 text-primary-600" />,
      title: "Smart Upload",
      description: "Drag & drop PDFs or images. Our AI instantly processes your legal documents."
    },
    {
      icon: <FileText className="w-8 h-8 text-primary-600" />,
      title: "OCR Extraction",
      description: "Advanced OCR technology extracts text from scanned documents and images."
    },
    {
      icon: <Brain className="w-8 h-8 text-primary-600" />,
      title: "AI Summarization",
      description: "Get plain-language summaries of complex legal clauses and terms."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "Risk Detection",
      description: "Automatically identify potentially risky clauses and legal pitfalls."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-primary-600" />,
      title: "Chat Interface",
      description: "Ask questions about your document and get instant AI-powered answers."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-600" />,
      title: "Instant Results",
      description: "No waiting, no storage. Get immediate analysis results in your browser."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <FileText className="w-8 h-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">LegalLens AI</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-900 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link href="/upload" className="btn-primary">
                Try Now
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-900 hover:text-primary-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="/" className="block px-3 py-2 text-gray-900 hover:text-primary-600">
                Home
              </Link>
              <Link href="/upload" className="block px-3 py-2 text-primary-600 font-medium">
                Try Now
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Legal Document
            <span className="text-primary-600"> Analysis</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload any legal document and get instant AI-powered analysis, summaries, 
            risk detection, and answers to your questions. No registration required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload" className="btn-primary text-lg px-8 py-3">
              Analyze Document
            </Link>
            <button className="btn-secondary text-lg px-8 py-3">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful AI Features</h2>
          <p className="text-lg text-gray-600">Everything you need to understand your legal documents</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-900 ml-3">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Analyze Your Legal Documents?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Get started in seconds. No account needed, completely free.
          </p>
          <Link href="/upload" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
            Start Analysis
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FileText className="w-6 h-6 text-primary-400" />
              <span className="ml-2 text-lg font-semibold">LegalLens AI</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 LegalLens AI. Powered by advanced AI technology.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}