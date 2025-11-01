import React from 'react'
import api from '../utils/api'

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

  return (
    <div className="tx-table">
      <h4>Transactions</h4>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {txs.map(t=> (
            <tr key={t._id}>
              <td>{t.title}</td>
              <td>{t.amount}</td>
              <td>{t.category}</td>
              <td>{t.type}</td>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td><button onClick={()=>remove(t._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}