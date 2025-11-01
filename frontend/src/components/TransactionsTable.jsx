import React from 'react'
import api from '../utils/api'
import { formatRupee } from '../utils/formatCurrency'

export default function TransactionsTable({ txs, onChanged }){
  const remove = async (id) => {
    if (!confirm('Delete transaction?')) return;
    try{ 
      await api.delete(`/transactions/${id}`); 
      onChanged && onChanged() 
    }catch(err){ 
      alert('Delete failed') 
    }
  }

  if (txs.length === 0) {
    return (
      <div className="tx-table card">
        <h4>Transactions</h4>
        <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-light)'}}>
          No transactions found. Add a transaction to get started.
        </div>
      </div>
    )
  }

  return (
    <div className="tx-table card">
      <h4>Transactions</h4>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {txs.map(t=> (
            <tr key={t._id}>
              <td>{t.title}</td>
              <td style={{
                fontWeight: '600',
                color: t.type === 'income' ? '#43e97b' : '#fa709a'
              }}>
                {t.type === 'income' ? '+' : '-'}{formatRupee(t.amount)}
              </td>
              <td>{t.category}</td>
              <td>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: t.type === 'income' 
                    ? 'rgba(67, 233, 123, 0.1)' 
                    : 'rgba(250, 112, 154, 0.1)',
                  color: t.type === 'income' ? '#43e97b' : '#fa709a'
                }}>
                  {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                </span>
              </td>
              <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
              <td>
                <button 
                  onClick={()=>remove(t._id)}
                  className="btn-danger btn-sm"
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--gradient-danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.05)'
                    e.target.style.boxShadow = '0 8px 16px rgba(250, 112, 154, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}