import { useEffect, useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface Clause {
  text: string
  type: 'risk' | 'neutral' | 'positive'
  riskLevel: 'high' | 'medium' | 'low'
  explanation: string
}

interface FlowVisualizerProps {
  clauses: Clause[]
}

export default function FlowVisualizer({ clauses }: FlowVisualizerProps) {
  const riskClauses = clauses.filter(clause => clause.type === 'risk')
  const neutralClauses = clauses.filter(clause => clause.type === 'neutral')
  const positiveClauses = clauses.filter(clause => clause.type === 'positive')

  const highRiskClauses = clauses.filter(clause => clause.riskLevel === 'high')
  const mediumRiskClauses = clauses.filter(clause => clause.riskLevel === 'medium')
  const lowRiskClauses = clauses.filter(clause => clause.riskLevel === 'low')

  // Clause Type Distribution
  const typeData = {
    labels: ['Risk Clauses', 'Neutral Clauses', 'Positive Clauses'],
    datasets: [
      {
        data: [riskClauses.length, neutralClauses.length, positiveClauses.length],
        backgroundColor: [
          '#ef4444', // red for risk
          '#6b7280', // gray for neutral
          '#22c55e', // green for positive
        ],
        borderColor: [
          '#dc2626',
          '#4b5563',
          '#16a34a',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Risk Level Distribution
  const riskLevelData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [
      {
        label: 'Number of Clauses',
        data: [highRiskClauses.length, mediumRiskClauses.length, lowRiskClauses.length],
        backgroundColor: [
          '#ef4444',
          '#f59e0b',
          '#22c55e',
        ],
        borderColor: [
          '#dc2626',
          '#d97706',
          '#16a34a',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Risk Level Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Clause Type Distribution',
      },
    },
  }

  // Calculate risk metrics
  const totalClauses = clauses.length
  const riskPercentage = totalClauses > 0 ? Math.round((riskClauses.length / totalClauses) * 100) : 0
  const positivePercentage = totalClauses > 0 ? Math.round((positiveClauses.length / totalClauses) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{totalClauses}</div>
              <div className="text-sm text-blue-700">Total Clauses</div>
            </div>
          </div>
        </div>
        <div className="card bg-danger-50 border-danger-200">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-danger-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-danger-900">{riskPercentage}%</div>
              <div className="text-sm text-danger-700">Risk Clauses</div>
            </div>
          </div>
        </div>
        <div className="card bg-success-50 border-success-200">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-success-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-success-900">{positivePercentage}%</div>
              <div className="text-sm text-success-700">Positive Clauses</div>
            </div>
          </div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <Info className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-yellow-900">{highRiskClauses.length}</div>
              <div className="text-sm text-yellow-700">High Risk Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {totalClauses > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clause Type Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clause Type Distribution</h3>
            <div className="h-64">
              <Doughnut data={typeData} options={doughnutOptions} />
            </div>
          </div>

          {/* Risk Level Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Analysis</h3>
            <div className="h-64">
              <Bar data={riskLevelData} options={chartOptions} />
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-8">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data to Visualize</h3>
          <p className="text-gray-600">
            No clauses were identified for visualization. The document may need further analysis.
          </p>
        </div>
      )}

      {/* Risk Timeline */}
      {totalClauses > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clause Flow Analysis</h3>
          <div className="space-y-4">
            {clauses.map((clause, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    clause.type === 'risk' ? 'bg-danger-600' :
                    clause.type === 'positive' ? 'bg-success-600' : 'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      clause.type === 'risk' ? 'bg-danger-100 text-danger-800' :
                      clause.type === 'positive' ? 'bg-success-100 text-success-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {clause.type.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      clause.riskLevel === 'high' ? 'bg-danger-50 border-danger-200 text-danger-800' :
                      clause.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                      'bg-success-50 border-success-200 text-success-800'
                    }`}>
                      {clause.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium mb-1">
                    {clause.text.length > 100 ? `${clause.text.substring(0, 100)}...` : clause.text}
                  </p>
                  <p className="text-xs text-gray-600">{clause.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Summary */}
      {totalClauses > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-danger-600 mb-2">{highRiskClauses.length}</div>
              <div className="text-sm text-gray-600">High Risk Clauses</div>
              <div className="text-xs text-gray-500 mt-1">Require immediate attention</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{mediumRiskClauses.length}</div>
              <div className="text-sm text-gray-600">Medium Risk Clauses</div>
              <div className="text-xs text-gray-500 mt-1">Should be reviewed carefully</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">{lowRiskClauses.length}</div>
              <div className="text-sm text-gray-600">Low Risk Clauses</div>
              <div className="text-xs text-gray-500 mt-1">Generally acceptable terms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}