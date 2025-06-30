import React, { useState } from 'react'
import Link from 'next/link'
import { FileText, Brain, Shield, MessageSquare, Upload, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import Layout, { PageWrapper, Section } from '../components/Layout'
import { APP_CONFIG } from '../config/constants'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  ];

  return (
    <Layout 
      title="LegalLens AI - Smart Legal Document Analysis"
      description="AI-powered legal document analysis with OCR, risk detection, and intelligent insights. Upload any legal document and get instant analysis."
      className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen"
      showHeader={false}
    >
      {/* Custom Navigation for Landing Page */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="relative">
                  <FileText className="w-8 h-8 text-cyan-400" />
                  <div className="absolute inset-0 w-8 h-8 bg-cyan-400/20 rounded-full blur-sm"></div>
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">LegalLens AI</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white/80 hover:text-cyan-400 transition-all duration-300 font-medium">
                Home
              </Link>
              <Link href="/demo" className="text-white/80 hover:text-cyan-400 transition-all duration-300 font-medium">
                Demo
              </Link>
              <Link href="/upload" className="relative group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2.5 rounded-full hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/25">
                <span className="relative z-10">Try Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white/80 hover:text-cyan-400 transition-colors"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/40 backdrop-blur-md border-t border-white/10">
              <Link href="/" className="block px-3 py-2 text-white/80 hover:text-cyan-400 transition-colors font-medium">
                Home
              </Link>
              <Link href="/demo" className="block px-3 py-2 text-white/80 hover:text-cyan-400 transition-colors font-medium">
                Demo
              </Link>
              <Link href="/upload" className="block px-3 py-2 text-cyan-400 font-medium">
                Try Now
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <PageWrapper className="pt-32 pb-20 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Free • No Registration • Privacy First
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              Smart Legal Document
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              Analysis
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Upload any legal document and get instant AI-powered analysis, summaries, 
            risk detection, and answers to your questions. No registration required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link 
              href="/upload" 
              className="group relative inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                Analyze Document
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </Link>
            <Link 
              href="/demo"
              className="group inline-flex items-center justify-center border-2 border-cyan-400/50 text-cyan-300 px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm"
            >
              <span className="flex items-center">
                Watch Demo
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">100%</div>
              <div className="text-gray-400 text-sm font-medium">Free to Use</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">0</div>
              <div className="text-gray-400 text-sm font-medium">Data Stored</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">AI</div>
              <div className="text-gray-400 text-sm font-medium">Powered</div>
            </div>
            <div className="group">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">Instant</div>
              <div className="text-gray-400 text-sm font-medium">Results</div>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Features Grid */}
      <Section className="bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <PageWrapper className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Powerful AI Features
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to understand your legal documents with cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                      {React.cloneElement(feature.icon, { className: "w-8 h-8 text-cyan-400" })}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </PageWrapper>
      </Section>

      {/* How It Works */}
      <Section className="bg-gradient-to-b from-slate-800 to-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
        <PageWrapper className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Simple steps to get insights from your legal documents in minutes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-full flex items-center justify-center mx-auto border border-cyan-500/30 group-hover:scale-110 transition-all duration-300">
                  <Upload className="w-10 h-10 text-cyan-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">Upload</h3>
              <p className="text-gray-300 leading-relaxed">Drag and drop your PDF or image file. We support various formats with instant processing.</p>
            </div>
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto border border-purple-500/30 group-hover:scale-110 transition-all duration-300">
                  <Brain className="w-10 h-10 text-purple-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">Analyze</h3>
              <p className="text-gray-300 leading-relaxed">Our advanced AI processes your document and extracts key information with precision.</p>
            </div>
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto border border-pink-500/30 group-hover:scale-110 transition-all duration-300">
                  <MessageSquare className="w-10 h-10 text-pink-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors">Explore</h3>
              <p className="text-gray-300 leading-relaxed">Review summaries, ask questions, and explore insights with our interactive interface.</p>
            </div>
          </div>
        </PageWrapper>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 50L0 0h100v100z\' fill=\'%23ffffff\' fill-opacity=\'0.05\'/%3E%3C/svg%3E')] opacity-30"></div>
        <PageWrapper className="text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Analyze Your Legal Documents?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Get started in seconds. No account needed, completely free, and your data stays private.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
               href="/upload" 
               className="group inline-flex items-center justify-center bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
             >
               Start Analysis
               <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link 
               href="/demo" 
               className="group inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold py-4 px-8 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
             >
               View Demo
               <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
         </PageWrapper>
       </Section>
     </Layout>
   )
 }