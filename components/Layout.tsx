// Main layout component with error boundary integration
import React from 'react'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import ErrorBoundary from './ErrorBoundary'
import { cn } from '../lib/utils'
import { APP_CONFIG } from '../config/constants'

const inter = Inter({ subsets: ['latin'] })

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  showHeader?: boolean
  showFooter?: boolean
}

export default function Layout({
  children,
  title = 'LegalLens AI - Smart Contract Analysis',
  description = 'AI-powered legal document analysis with OCR, risk detection, and intelligent insights.',
  className,
  showHeader = true,
  showFooter = true
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="LegalLens AI" />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="LegalLens AI" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
      </Head>

      <div className={cn(
        'min-h-screen bg-gray-50 flex flex-col',
        inter.className,
        className
      )}>
        <ErrorBoundary>
          {showHeader && <Header />}
          
          <main className="flex-1">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          
          {showFooter && <Footer />}
        </ErrorBoundary>
      </div>
    </>
  )
}

// Header component
function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">
                LegalLens AI
              </h1>
            </div>
            <div className="hidden md:block ml-4">
              <p className="text-sm text-gray-600">
                Smart Contract Analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// Footer component
function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              About LegalLens AI
            </h3>
            <p className="mt-4 text-sm text-gray-600">
              Advanced AI-powered legal document analysis with OCR, risk detection, 
              and intelligent insights. Free to use with no registration required.
            </p>
          </div>
          
          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Features
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Smart Document Upload</li>
              <li>• OCR Text Extraction</li>
              <li>• Risk Analysis</li>
              <li>• Interactive Chat</li>
              <li>• Visual Flow Analysis</li>
            </ul>
          </div>
          
          {/* Privacy & Security */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Privacy & Security
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• No data stored permanently</li>
              <li>• Client-side processing</li>
              <li>• Secure file handling</li>
              <li>• GDPR compliant</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {currentYear} LegalLens AI. All rights reserved.
            </p>
            
            <div className="mt-4 md:mt-0 flex space-x-6 text-sm text-gray-500">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Support</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              ⚠️ Disclaimer: This tool provides AI-generated analysis for informational purposes only. 
              Always consult qualified legal professionals for legal advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Page wrapper for consistent spacing
export function PageWrapper({ 
  children, 
  className,
  maxWidth = '7xl'
}: { 
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
}) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  }

  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8 py-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

// Section wrapper for consistent styling
export function Section({ 
  children, 
  className,
  title,
  description
}: { 
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}) {
  return (
    <section className={cn('py-8', className)}>
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}