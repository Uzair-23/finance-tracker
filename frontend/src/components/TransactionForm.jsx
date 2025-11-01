import React, { useState } from 'react'
import api from '../utils/api'

export default function TransactionForm({ onSaved }){
  const [title,setTitle]=useState('')
  const [amount,setAmount]=useState(0)
  const [category,setCategory]=useState('General')
  const [type,setType]=useState('expense')
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))

  const submit = async (e) => {
    e.preventDefault()
    try{
      await api.post('/transactions', { 
        title, 
        amount: Number(amount), 
        category, 
        type, 
        date 
      })
      setTitle(''); setAmount(0); setCategory('General'); setType('expense');
      onSaved && onSaved()
    }catch(err){ alert('Save failed') }
  }

  return (
    <form className="tx-form card" onSubmit={submit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.5rem'
    }}>
      <h4 style={{
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: '700',
        marginBottom: '0.5rem'
      }}>Add Transaction</h4>
      
      <div className="form-group">
        <label>Title</label>
        <input 
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
          placeholder="Transaction title" 
          required 
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Amount (₹)</label>
        <input 
          value={amount} 
          onChange={e=>setAmount(e.target.value)} 
          type="number" 
          placeholder="Enter amount" 
          required 
          min="0"
          step="0.01"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <input 
          value={category} 
          onChange={e=>setCategory(e.target.value)} 
          placeholder="e.g., Food, Salary, Rent" 
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Type</label>
        <select 
          value={type} 
          onChange={e=>setType(e.target.value)}
          className="form-input"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="form-group">
        <label>Date</label>
        <input 
          value={date} 
          onChange={e=>setDate(e.target.value)} 
          type="date"
          className="form-input"
        />
      </div>

      <button type="submit" className="btn-primary btn-block">Save Transaction</button>
    </form>
  )
}