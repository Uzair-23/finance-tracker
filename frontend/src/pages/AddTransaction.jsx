import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import TransactionForm from '../components/TransactionForm'
import Toast from '../components/Toast'

export default function AddTransaction() {
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const handleSaved = async () => {
    setToast('Transaction added successfully!')
    setTimeout(() => {
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Add Transaction</h1>
        <p>Record a new income or expense transaction</p>
      </div>
      <TransactionForm onSaved={handleSaved} />
      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  )
}

