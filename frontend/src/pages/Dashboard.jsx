import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import TransactionsTable from '../components/TransactionsTable'
import FilterBar from '../components/FilterBar'
import Charts from '../components/Charts'
import MarketOverview from '../components/MarketOverview'
import InsightsWidget from '../components/InsightsWidget'
import ErrorBoundary from '../components/ErrorBoundary'
import Toast from '../components/Toast'
import RiskEvaluator from '../components/RiskEvaluator'
import { useAuth } from '../context/AuthContext'
import { formatRupee } from '../utils/formatCurrency'

export default function Dashboard(){
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [prevSummary, setPrevSummary] = useState(null)
  const [toast, setToast] = useState(null)
  const [filters, setFilters] = useState({})
  const [assets, setAssets] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalAmount, setGoalAmount] = useState('')
  const [goalType, setGoalType] = useState('monthly')
  const { user, updateUser } = useAuth()

  // Get selected month from sessionStorage
  useEffect(() => {
    const month = sessionStorage.getItem('selectedMonth')
    if (month) {
      setSelectedMonth(month)
      // Parse month to get start and end dates
      const [year, monthNum] = month.split('-')
      const startDate = `${year}-${monthNum}-01`
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate()
      const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`
      setFilters({ startDate, endDate })
    }
  }, [])

  const load = async () => {
    try {
      // Build query string from filters
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.category) params.append('category', filters.category)
      
      const queryString = params.toString()
      const url = `/transactions${queryString ? `?${queryString}` : ''}`
      
      // Also filter summary and analysis by month if month is selected
      const summaryUrl = `/transactions/summary/stats${queryString ? `?${queryString}` : ''}`
      
      // Calculate previous period dates for comparison
      let prevParams = new URLSearchParams()
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate)
        const endDate = new Date(filters.endDate)
        const diffTime = endDate - startDate
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        
        const prevEndDate = new Date(startDate)
        prevEndDate.setDate(prevEndDate.getDate() - 1)
        const prevStartDate = new Date(prevEndDate)
        prevStartDate.setDate(prevStartDate.getDate() - diffDays + 1)
        
        prevParams.append('startDate', prevStartDate.toISOString().split('T')[0])
        prevParams.append('endDate', prevEndDate.toISOString().split('T')[0])
      }
      
      const prevSummaryUrl = `/transactions/summary/stats${prevParams.toString() ? `?${prevParams.toString()}` : ''}`
      
      const [txRes, summaryRes, prevSummaryRes, assetsRes, analysisRes] = await Promise.all([
        api.get(url),
        api.get(summaryUrl),
        api.get(prevSummaryUrl).catch(() => ({ data: { totalIncome: 0, totalExpense: 0, balance: 0 } })),
        api.get('/assets'),
        api.get(`/assets/analysis${queryString ? `?${queryString}` : ''}`)
      ])

      setTransactions(txRes.data)
      setSummary(summaryRes.data)
      setPrevSummary(prevSummaryRes.data)
      setAssets(assetsRes.data)
      setAnalysis(analysisRes.data)

      // Initialize goal amount if user has a saving goal
      if (user && user.savingGoal && !goalAmount) {
        setGoalAmount(user.savingGoal.toString())
        setGoalType(user.savingGoalType || 'monthly')
      }

      // overspending alert check
      if (user && user.monthlyBudget && summaryRes.data.totalExpense > user.monthlyBudget) {
        setToast(`Alert: You've exceeded your monthly budget of ${formatRupee(user.monthlyBudget)}`)
      }
    } catch(err) { 
      console.error(err)
      setToast('Failed to load some data. Please try again.')
    }
  }

  useEffect(() => { 
    load() 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.category])

  // Listen for month changes from sidebar
  useEffect(() => {
    const handleStorageChange = () => {
      const month = sessionStorage.getItem('selectedMonth')
      if (month && month !== selectedMonth) {
        setSelectedMonth(month)
        const [year, monthNum] = month.split('-')
        const startDate = `${year}-${monthNum}-01`
        const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate()
        const endDate = `${year}-${monthNum}-${String(lastDay).padStart(2, '0')}`
        setFilters({ startDate, endDate })
      }
    }

    window.addEventListener('storage', handleStorageChange)
    // Also check periodically for sessionStorage changes (same-tab)
    const interval = setInterval(() => {
      handleStorageChange()
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [selectedMonth])

  // Calculate saving rate
  const savingRate = summary && summary.totalIncome > 0 
    ? ((summary.totalIncome - summary.totalExpense) / summary.totalIncome * 100).toFixed(1)
    : 0

  // Calculate previous saving rate
  const prevSavingRate = prevSummary && prevSummary.totalIncome > 0
    ? ((prevSummary.totalIncome - prevSummary.totalExpense) / prevSummary.totalIncome * 100).toFixed(1)
    : 0

  const actualSavings = summary ? (summary.totalIncome - summary.totalExpense) : 0

  // Calculate comparisons
  const incomeDiff = summary && prevSummary ? (summary.totalIncome - (prevSummary.totalIncome || 0)) : 0
  const expenseDiff = summary && prevSummary ? (summary.totalExpense - (prevSummary.totalExpense || 0)) : 0
  const balanceDiff = summary && prevSummary ? (summary.balance - (prevSummary.balance || 0)) : 0

  // Handle saving goal update
  const handleSaveGoal = async () => {
    if (!goalAmount || parseFloat(goalAmount) <= 0) {
      setToast('Please enter a valid saving goal amount')
      return
    }

    try {
      const res = await api.put('/auth/profile', {
        savingGoal: parseFloat(goalAmount),
        savingGoalType: goalType
      })
      updateUser(res.data.user)
      setEditingGoal(false)
      setToast('Saving goal updated successfully!')
    } catch (err) {
      setToast('Failed to update saving goal. Please try again.')
      console.error(err)
    }
  }

  // Calculate progress toward saving goal
  const goalProgress = user && user.savingGoal > 0
    ? Math.min((actualSavings / user.savingGoal) * 100, 100).toFixed(1)
    : 0

  return (
    <div className="dashboard page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>{selectedMonth ? `Viewing data for ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Your financial overview'}</p>
      </div>

      <section className="summary">
        <h3>Dashboard Summary</h3>
        {summary ? (
          <div className="cards" style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem'}}>
            {/* Income Card */}
            <div className="card">
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <span style={{fontSize: '0.875rem', color: '#666', fontWeight: '500'}}>Income</span>
                <span style={{fontSize: '1.75rem', fontWeight: '700', color: '#43e97b'}}>
                  {formatRupee(summary.totalIncome || 0)}
                </span>
                {prevSummary && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    background: incomeDiff >= 0 ? 'rgba(67, 233, 123, 0.15)' : 'rgba(250, 112, 154, 0.15)',
                    color: incomeDiff >= 0 ? '#43e97b' : '#fa709a',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    width: 'fit-content'
                  }}>
                    {incomeDiff >= 0 ? '+' : ''}{Math.abs(incomeDiff).toLocaleString('en-IN', {maximumFractionDigits: 0})} vs prev
                  </div>
                )}
              </div>
            </div>

            {/* Spendings Card */}
            <div className="card">
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <span style={{fontSize: '0.875rem', color: '#666', fontWeight: '500'}}>Spendings</span>
                <span style={{fontSize: '1.75rem', fontWeight: '700', color: '#fa709a'}}>
                  {formatRupee(summary.totalExpense || 0)}
                </span>
                {prevSummary && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    background: expenseDiff >= 0 ? 'rgba(250, 112, 154, 0.15)' : 'rgba(67, 233, 123, 0.15)',
                    color: expenseDiff >= 0 ? '#fa709a' : '#43e97b',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    width: 'fit-content'
                  }}>
                    {expenseDiff >= 0 ? '+' : ''}{Math.abs(expenseDiff).toLocaleString('en-IN', {maximumFractionDigits: 0})} vs prev
                  </div>
                )}
              </div>
            </div>

            {/* Balance Card */}
            <div className="card">
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <span style={{fontSize: '0.875rem', color: '#666', fontWeight: '500'}}>Balance</span>
                <span style={{
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: summary.balance >= 0 ? '#667eea' : '#fa709a'
                }}>
                  {formatRupee(summary.balance || 0)}
                </span>
                {prevSummary && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    background: balanceDiff >= 0 ? 'rgba(67, 233, 123, 0.15)' : 'rgba(250, 112, 154, 0.15)',
                    color: balanceDiff >= 0 ? '#43e97b' : '#fa709a',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    width: 'fit-content'
                  }}>
                    {balanceDiff >= 0 ? '+' : ''}{Math.abs(balanceDiff).toLocaleString('en-IN', {maximumFractionDigits: 0})} vs prev
                  </div>
                )}
              </div>
            </div>

            {/* Savings Rate Card */}
            <div className="card">
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <span style={{fontSize: '0.875rem', color: '#666', fontWeight: '500'}}>Savings Rate</span>
                <span style={{
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: parseFloat(savingRate) >= 20 
                    ? '#43e97b'
                    : parseFloat(savingRate) >= 10
                    ? '#fbbf24'
                    : '#fa709a'
                }}>
                  {savingRate}%
                </span>
                <div style={{fontSize: '0.75rem', color: '#999'}}>
                  Target 20% • Prev {prevSavingRate}%
                </div>
              </div>
            </div>

            {/* Savings Goal Card */}
            <div className="card">
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <span style={{fontSize: '0.875rem', color: '#666', fontWeight: '500'}}>Savings Goal</span>
                <span style={{fontSize: '1.75rem', fontWeight: '700', color: '#333'}}>
                  {user?.savingGoal ? formatRupee(user.savingGoal) : formatRupee(0)}
                </span>
                <button
                  onClick={() => {
                    setEditingGoal(true)
                    setGoalAmount(user?.savingGoal?.toString() || '')
                    setGoalType(user?.savingGoalType || 'monthly')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    textDecoration: 'underline'
                  }}
                >
                  Set/Change Goal
                </button>
              </div>
            </div>
          </div>
        ) : <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-light)'}}>Loading summary...</div>}
      </section>

      {/* Saving Goal Section - Only show when editing */}
      {editingGoal && (
      <section className="saving-goal-section">
        <div className="card" style={{position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gradient-primary)'}}></div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
            <div style={{flex: 1}}>
              <h4 style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '700',
                marginBottom: '0.5rem'
              }}>
                Saving Goal
              </h4>
              {!editingGoal && user?.savingGoal > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div style={{fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.25rem'}}>
                        {user.savingGoalType === 'monthly' ? 'Monthly Goal' : user.savingGoalType === 'yearly' ? 'Yearly Goal' : 'Custom Goal'}
                      </div>
                      <div style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)'}}>
                        {formatRupee(user.savingGoal)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingGoal(true)
                        setGoalAmount(user.savingGoal.toString())
                        setGoalType(user.savingGoalType || 'monthly')
                      }}
                      className="btn-secondary"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Edit Goal
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{marginTop: '0.5rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem'}}>
                      <span style={{color: 'var(--text-light)'}}>Progress</span>
                      <span style={{fontWeight: '600', color: 'var(--text-dark)'}}>
                        {goalProgress}% • {formatRupee(actualSavings)} / {formatRupee(user.savingGoal)}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '12px',
                      background: 'rgba(102, 126, 234, 0.1)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${goalProgress}%`,
                        height: '100%',
                        background: parseFloat(goalProgress) >= 100
                          ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                          : 'var(--gradient-primary)',
                        borderRadius: '6px',
                        transition: 'width 0.5s ease',
                        boxShadow: parseFloat(goalProgress) >= 100 ? '0 0 10px rgba(67, 233, 123, 0.5)' : 'none'
                      }}></div>
                    </div>
                    {parseFloat(goalProgress) >= 100 && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        color: '#43e97b',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        🎉 Goal Achieved!
                      </div>
                    )}
                  </div>
                </div>
              ) : editingGoal ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div style={{display: 'flex', gap: '0.75rem', alignItems: 'flex-end'}}>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.5rem', fontWeight: '500'}}>
                        Goal Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(e.target.value)}
                        placeholder="Enter saving goal"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid var(--border)',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: '600',
                          transition: 'all 0.3s'
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div style={{width: '150px'}}>
                      <label style={{display: 'block', fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.5rem', fontWeight: '500'}}>
                        Type
                      </label>
                      <select
                        value={goalType}
                        onChange={(e) => setGoalType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid var(--border)',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button
                      onClick={handleSaveGoal}
                      className="btn-primary"
                      style={{flex: 1}}
                    >
                      Save Goal
                    </button>
                    <button
                      onClick={() => {
                        setEditingGoal(false)
                        setGoalAmount(user?.savingGoal?.toString() || '')
                        setGoalType(user?.savingGoalType || 'monthly')
                      }}
                      className="btn-secondary"
                      style={{flex: 1}}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <p style={{color: 'var(--text-light)', fontSize: '0.875rem'}}>
                    Set a saving goal to track your progress and stay motivated!
                  </p>
                  <button
                    onClick={() => {
                      setEditingGoal(true)
                      setGoalAmount('')
                      setGoalType('monthly')
                    }}
                    className="btn-primary"
                  >
                    Set Saving Goal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      <section className="charts">
        <ErrorBoundary>
          <Charts transactions={transactions} />
        </ErrorBoundary>
      </section>

      <section className="market-insights-grid">
        <MarketOverview />
        <InsightsWidget />
      </section>

      <section className="risk-analysis">
        <RiskEvaluator analysis={analysis} />
      </section>

      <section className="tx">
        <FilterBar 
          categories={[...new Set(transactions.map(t => t.category))]} 
          onFilter={(newFilters) => {
            setFilters({...filters, ...newFilters})
          }} 
        />
        <TransactionsTable txs={transactions} onChanged={load} />
      </section>

      <Toast message={toast} onClose={()=>setToast(null)} />
    </div>
  )
}