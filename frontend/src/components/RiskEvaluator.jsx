import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../utils/api';

export default function RiskEvaluator() {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEvaluate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/transactions/evaluate-risk');
      setEvaluation(response.data);
    } catch (err) {
      setError('Failed to evaluate financial risk. Please try again.');
      console.error('Error evaluating risk:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'var(--risk-high)';
      case 'medium': return 'var(--risk-medium)';
      case 'safe': return 'var(--risk-low)';
      default: return 'var(--text)';
    }
  };

  return (
    <div className="risk-evaluator card" style={{position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gradient-primary)'}} />
      <h3 style={{
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1.5rem'
      }}>
         Financial Risk Evaluator
      </h3>

      <div className="risk-evaluation-content">
        <button
          onClick={handleEvaluate}
          className="evaluate-button"
          disabled={loading}
          style={{
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: loading ? 'default' : 'pointer',
            fontWeight: '600',
            width: '100%',
            transition: 'transform 0.2s ease',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Evaluating...' : 'Evaluate Financial Risk'}
        </button>

        {error && (
          <div
            className="error-message"
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '4px solid var(--risk-high)',
              color: 'var(--risk-high)'
            }}
          >
            {error}
          </div>
        )}

        {evaluation && (
          <div className="evaluation-results" style={{ marginTop: '1.5rem' }}>
            <div
              className="risk-message"
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: `rgba(${evaluation.riskLevel === 'high' ? '239, 68, 68' : evaluation.riskLevel === 'medium' ? '245, 158, 11' : '16, 185, 129'}, 0.1)`,
                borderLeft: `4px solid ${getRiskColor(evaluation.riskLevel)}`,
                marginBottom: '1rem'
              }}
            >
              {evaluation.message}
            </div>

            <div className="stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div className="stat-item">
                <span className="label">Monthly Income</span>
                <span className="value">{formatCurrency(evaluation.stats.monthlyIncome)}</span>
              </div>
              <div className="stat-item">
                <span className="label">Monthly Expenses</span>
                <span className="value">{formatCurrency(evaluation.stats.monthlyExpenses)}</span>
              </div>
              <div className="stat-item">
                <span className="label">Monthly Savings</span>
                <span className="value">{formatCurrency(evaluation.stats.monthlySavings)}</span>
              </div>
              <div className="stat-item">
                <span className="label">Savings Rate</span>
                <span className="value">{evaluation.stats.savingsPercentage}%</span>
              </div>
            </div>

            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
              <div className="suggestions">
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--text)' }}>Recommendations</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {evaluation.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      style={{
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        backgroundColor: 'rgba(37, 99, 235, 0.03)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span></span> {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
