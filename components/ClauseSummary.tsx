import { AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react'

interface Clause {
  text: string
  type: 'risk' | 'neutral' | 'positive'
  riskLevel: 'high' | 'medium' | 'low'
  explanation: string
}

interface ClauseSummaryProps {
  summary: string
  clauses: Clause[]
  riskScore: number
}

export default function ClauseSummary({ summary, clauses, riskScore }: ClauseSummaryProps) {
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-danger-600" />
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-600" />
      case 'low':
        return <CheckCircle className="w-5 h-5 text-success-600" />
      default:
        return <Shield className="w-5 h-5 text-gray-600" />
    }
  }

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'risk-high'
      case 'medium':
        return 'risk-medium'
      case 'low':
        return 'risk-low'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="w-4 h-4 text-danger-600" />
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-success-600" />
      default:
        return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  const riskClauses = clauses.filter(clause => clause.type === 'risk')
  const neutralClauses = clauses.filter(clause => clause.type === 'neutral')
  const positiveClauses = clauses.filter(clause => clause.type === 'positive')

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Document Summary</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Overall Risk Score:</span>
            <span className={`text-lg font-bold ${
              riskScore >= 70 ? 'text-danger-600' :
              riskScore >= 40 ? 'text-yellow-600' : 'text-success-600'
            }`}>
              {riskScore}%
            </span>
          </div>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-danger-50 border-danger-200">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-danger-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-danger-900">{riskClauses.length}</div>
              <div className="text-sm text-danger-700">Risk Clauses</div>
            </div>
          </div>
        </div>
        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center">
            <Info className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{neutralClauses.length}</div>
              <div className="text-sm text-gray-700">Neutral Clauses</div>
            </div>
          </div>
        </div>
        <div className="card bg-success-50 border-success-200">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-success-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-success-900">{positiveClauses.length}</div>
              <div className="text-sm text-success-700">Positive Clauses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Clauses */}
      {riskClauses.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-danger-600 mr-2" />
            Risk Clauses ({riskClauses.length})
          </h3>
          <div className="space-y-4">
            {riskClauses.map((clause, index) => (
              <div key={index} className="border border-danger-200 rounded-lg p-4 bg-danger-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    {getRiskIcon(clause.riskLevel)}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeClass(clause.riskLevel)}`}>
                      {clause.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  {getTypeIcon(clause.type)}
                </div>
                <blockquote className="text-sm text-gray-800 italic mb-3 pl-4 border-l-2 border-danger-300">
                  "{clause.text}"
                </blockquote>
                <p className="text-sm text-danger-800">
                  <strong>Risk Analysis:</strong> {clause.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Neutral Clauses */}
      {neutralClauses.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 text-gray-600 mr-2" />
            Neutral Clauses ({neutralClauses.length})
          </h3>
          <div className="space-y-4">
            {neutralClauses.map((clause, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 border-gray-300 text-gray-800">
                    NEUTRAL
                  </span>
                  {getTypeIcon(clause.type)}
                </div>
                <blockquote className="text-sm text-gray-800 italic mb-3 pl-4 border-l-2 border-gray-300">
                  "{clause.text}"
                </blockquote>
                <p className="text-sm text-gray-700">
                  <strong>Analysis:</strong> {clause.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positive Clauses */}
      {positiveClauses.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-success-600 mr-2" />
            Positive Clauses ({positiveClauses.length})
          </h3>
          <div className="space-y-4">
            {positiveClauses.map((clause, index) => (
              <div key={index} className="border border-success-200 rounded-lg p-4 bg-success-50">
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium border bg-success-100 border-success-300 text-success-800">
                    POSITIVE
                  </span>
                  {getTypeIcon(clause.type)}
                </div>
                <blockquote className="text-sm text-gray-800 italic mb-3 pl-4 border-l-2 border-success-300">
                  "{clause.text}"
                </blockquote>
                <p className="text-sm text-success-800">
                  <strong>Benefits:</strong> {clause.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Clauses Found */}
      {clauses.length === 0 && (
        <div className="card text-center py-8">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Specific Clauses Identified</h3>
          <p className="text-gray-600">
            The document analysis is complete, but no specific clauses were categorized. 
            You can still use the chat feature to ask questions about the document.
          </p>
        </div>
      )}
    </div>
  )
}