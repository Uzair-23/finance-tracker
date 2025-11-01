import React from 'react'

export default function RiskEvaluator({ analysis }) {
  if (!analysis) return null

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'var(--risk-high)'
      case 'medium': return 'var(--risk-medium)'
      case 'low': return 'var(--risk-low)'
      default: return 'var(--text)'
    }
  }

  const formatPercent = (value) => {
    return `${Math.round(value)}%`
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  return (
    <div className="risk-evaluator card">
      <h3>Financial Health Analysis</h3>
      
      <div className="risk-summary">
        <div className="risk-level" style={{ '--risk-color': getRiskColor(analysis.risk.level) }}>
          <span className="risk-badge">{analysis.risk.level}</span>
          Risk Level
        </div>
        
        <div className="risk-metrics">
          <div className="metric">
            <span className="label">Monthly Income</span>
            <span className="value">{formatCurrency(analysis.summary.monthlyIncome)}</span>
          </div>
          <div className="metric">
            <span className="label">Monthly Expenses</span>
            <span className="value">{formatCurrency(analysis.summary.monthlyExpenses)}</span>
          </div>
          <div className="metric">
            <span className="label">Savings Rate</span>
            <span className="value">{formatPercent(analysis.summary.savingsRate)}</span>
          </div>
          <div className="metric">
            <span className="label">Total Assets</span>
            <span className="value">{formatCurrency(analysis.summary.totalAssetsValue)}</span>
          </div>
        </div>
      </div>

      {analysis.risk.factors.length > 0 && (
        <div className="risk-factors">
          <h4>Risk Factors</h4>
          <ul>
            {analysis.risk.factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.risk.suggestions.length > 0 && (
        <div className="risk-suggestions">
          <h4>Suggestions</h4>
          <ul>
            {analysis.risk.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}