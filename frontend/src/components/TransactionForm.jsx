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
    <form className="tx-form" onSubmit={submit}>
      <h4>Add Transaction</h4>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required />
      <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="Amount" required />
      <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" />
      <select value={type} onChange={e=>setType(e.target.value)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input value={date} onChange={e=>setDate(e.target.value)} type="date" />
      <button type="submit">Save</button>
    </form>
  )
}