import React from 'react'
import { formatCurrency } from '../utils/formatCurrency'

export default function RiskEvaluator({ analysis }) {
  if (!analysis) {
    return (
      <div className="risk-evaluator card" style={{position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gradient-primary)'}}></div>
        <h3 style={{background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Financial Health Analysis</h3>
        <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-light)'}}>
          <p>No analysis data available. Add transactions and assets to see your financial health analysis.</p>
        </div>
      </div>
    )
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'var(--risk-high)'
      case 'medium': return 'var(--risk-medium)'
      case 'low': return 'var(--risk-low)'
      default: return 'var(--text)'
    }
  }

  const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0%'
    return `${Math.round(value)}%`
  }

  return (
    <div className="risk-evaluator card" style={{position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gradient-primary)'}}></div>
      <h3 style={{background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Financial Health Analysis</h3>
      
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