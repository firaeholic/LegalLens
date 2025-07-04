import React, { useState } from 'react'
import Link from 'next/link'
import { Eye, Brain, MessageSquare, Shield, ArrowLeft, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import Layout from '../components/Layout'
import {PageWrapper} from '../components/Layout'
import {Section} from '../components/Layout'
import ClauseSummary from '../components/ClauseSummary'
import ChatWithDoc from '../components/ChatWithDoc'
import FlowVisualizer from '../components/FlowVisualizer'

// Sample demo data
const demoAnalysis = {
  riskScore: 7.5,
  summary: {
    content: "This employment contract contains several high-risk clauses that require careful attention. The non-compete clause is particularly broad and may not be enforceable in all jurisdictions. The termination clause lacks clarity regarding severance pay calculations."
  },
  clauses: [
    {
      id: '1',
      type: 'Non-Compete',
      content: 'Employee agrees not to engage in any business that competes with the Company for a period of 2 years within a 50-mile radius.',
      riskLevel: 'high' as const,
      explanation: 'This non-compete clause is overly broad in both time and geographic scope, which may make it unenforceable.',
      suggestions: ['Reduce the time period to 6-12 months', 'Limit the geographic scope to areas where the company actually operates', 'Consider adding compensation for the non-compete period']
    },
    {
      id: '2',
      type: 'Termination',
      content: 'Either party may terminate this agreement with 30 days written notice. Upon termination, employee shall receive severance pay as determined by the Company.',
      riskLevel: 'medium' as const,
      explanation: 'The severance pay calculation is left to company discretion, creating uncertainty.',
      suggestions: ['Specify exact severance calculation formula', 'Include minimum severance amounts', 'Clarify what constitutes "cause" for termination']
    },
    {
      id: '3',
      type: 'Intellectual Property',
      content: 'All work product, inventions, and intellectual property created during employment shall belong to the Company.',
      riskLevel: 'low' as const,
      explanation: 'Standard intellectual property assignment clause with reasonable scope.',
      suggestions: ['Consider excluding inventions created on personal time with personal resources']
    }
  ],
  ocrResult: {
    extractedText: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on [DATE] between [COMPANY NAME], a [STATE] corporation ("Company"), and [EMPLOYEE NAME] ("Employee").

1. POSITION AND DUTIES
Employee shall serve as [POSITION] and shall perform such duties as may be assigned by the Company.

2. COMPENSATION
Employee shall receive a base salary of $[AMOUNT] per year, payable in accordance with Company's standard payroll practices.

3. NON-COMPETE
Employee agrees not to engage in any business that competes with the Company for a period of 2 years within a 50-mile radius.

4. TERMINATION
Either party may terminate this agreement with 30 days written notice. Upon termination, employee shall receive severance pay as determined by the Company.

5. INTELLECTUAL PROPERTY
All work product, inventions, and intellectual property created during employment shall belong to the Company.

[Additional clauses and signatures follow...]`
  }
}

const demoFile = {
  name: 'employment-contract-sample.pdf',
  size: 245760,
  type: 'application/pdf'
}

type TabType = 'document' | 'summary' | 'chat' | 'flow'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<TabType>('summary')

  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab)
  }

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskLevel = (score: number) => {
    if (score >= 8) return 'High Risk'
    if (score >= 6) return 'Medium Risk'
    return 'Low Risk'
  }

  return (
    <Layout>
      <PageWrapper>
        {/* Header */}
        <Section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Demo Analysis</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </button>
            </div>
          </div>
        </Section>

        {/* Demo Notice */}
        <Section>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Demo Mode
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This is a demonstration of LegalLens analysis capabilities using a sample employment contract. 
                    The analysis shown here represents typical output from my AI-powered legal document review system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Risk Score Overview */}
        <Section>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Risk Assessment</h2>
                <p className="text-sm text-gray-600">Overall contract risk evaluation</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {demoAnalysis.riskScore}/10
                </div>
                <div className={`text-sm font-medium ${getRiskColor(demoAnalysis.riskScore)}`}>
                  {getRiskLevel(demoAnalysis.riskScore)}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Tab Navigation */}
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
                  onClick={() => handleTabSwitch(id as TabType)}
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

        {/* Tab Content */}
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeTab === 'document' && (
              <>
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">{demoFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(demoFile.size / 1024).toFixed(1)} KB • {demoFile.type}
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        PDF viewer would be displayed here in the actual application
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Extracted Text</h3>
                    <div className="max-h-96 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                      {demoAnalysis.ocrResult.extractedText}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'summary' && (
              <div className="lg:col-span-3">
                <ClauseSummary 
                  summary={demoAnalysis.summary.content}
                  clauses={demoAnalysis.clauses.map(clause => ({
                    text: clause.content,
                    type: clause.riskLevel === 'high' ? 'risk' as const : 
                          clause.riskLevel === 'low' ? 'positive' as const : 'neutral' as const,
                    riskLevel: clause.riskLevel,
                    explanation: clause.explanation
                  }))}
                  riskScore={demoAnalysis.riskScore}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat with Document</h3>
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Interactive Chat Feature</p>
                    <p className="text-sm text-gray-500">
                      In the full application, you can ask questions about the document and get AI-powered responses.
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="bg-white rounded-lg p-3 text-left border">
                        <p className="text-sm text-gray-600 mb-1">Sample Question:</p>
                        <p className="text-sm font-medium">What are the main risks in this contract?</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-left border border-blue-200">
                        <p className="text-sm text-blue-600 mb-1">AI Response:</p>
                        <p className="text-sm">The main risks include an overly broad non-compete clause and unclear severance terms...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'flow' && (
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Flow Visualization</h3>
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Visual Contract Analysis</p>
                    <p className="text-sm text-gray-500 mb-6">
                      Interactive flowchart showing contract structure and clause relationships.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      <div className="bg-white rounded-lg p-4 border border-red-200">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-red-700">High Risk</p>
                        <p className="text-xs text-red-600">Non-Compete Clause</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-yellow-700">Medium Risk</p>
                        <p className="text-xs text-yellow-600">Termination Terms</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-700">Low Risk</p>
                        <p className="text-xs text-green-600">IP Assignment</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>
      </PageWrapper>
    </Layout>
  )
}