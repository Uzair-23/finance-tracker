import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import TransactionForm from '../components/TransactionForm'
import TransactionsTable from '../components/TransactionsTable'
import FilterBar from '../components/FilterBar'
import Charts from '../components/Charts'
import MarketOverview from '../components/MarketOverview'
import InsightsWidget from '../components/InsightsWidget'
import ErrorBoundary from '../components/ErrorBoundary'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'

export default function Dashboard(){
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [toast, setToast] = useState(null)
  const [filters, setFilters] = useState({})
  const { user } = useAuth()

  const load = async () => {
    try{
      // Build query string from filters
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.category) params.append('category', filters.category)
      
      const queryString = params.toString()
      const url = `/transactions${queryString ? `?${queryString}` : ''}`
      
      const r = await api.get(url)
      setTransactions(r.data)
      const s = await api.get('/transactions/summary/stats')
      setSummary(s.data)
      // overspending alert check
      if (user && user.monthlyBudget && s.data.totalExpense > user.monthlyBudget){
        setToast(`Alert: You've exceeded your monthly budget of ${user.monthlyBudget}`)
      }
    }catch(err){ console.error(err) }
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="dashboard">
      <section className="summary">
        <h3>Dashboard Summary</h3>
        {summary ? (
          <div className="cards">
            <div className="card">Income: {summary.totalIncome}</div>
            <div className="card">Expense: {summary.totalExpense}</div>
            <div className="card">Balance: {summary.balance}</div>
          </div>
        ) : <div>Loading summary...</div>}
      </section>

      <section className="charts">
        <ErrorBoundary>
          <Charts transactions={transactions} />
        </ErrorBoundary>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:12,marginTop:12}}>
        <MarketOverview />
        <InsightsWidget />
      </section>

      <section className="tx">
        <TransactionForm onSaved={load} />
        <FilterBar 
          categories={[...new Set(transactions.map(t => t.category))]} 
          onFilter={(newFilters) => {
            setFilters(newFilters)
            load()
          }} 
        />
        <TransactionsTable txs={transactions} onChanged={load} />
      </section>

      <Toast message={toast} onClose={()=>setToast(null)} />
    </div>
  )
}