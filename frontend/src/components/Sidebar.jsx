import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

export default function Sidebar({ onToggle, initialCollapsed }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (initialCollapsed !== undefined) {
      return initialCollapsed
    }
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Sync with App.jsx state if provided
  useEffect(() => {
    if (initialCollapsed !== undefined && initialCollapsed !== isCollapsed) {
      setIsCollapsed(initialCollapsed)
    }
  }, [initialCollapsed])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', newState.toString())
    if (onToggle) {
      onToggle(newState)
    }
  }

  const handleMonthChange = (e) => {
    const month = e.target.value
    setSelectedMonth(month)
    // Store month in sessionStorage to be accessed by dashboard
    sessionStorage.setItem('selectedMonth', month)
    // Trigger a custom event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'selectedMonth',
      newValue: month
    }))
  }

  // Initialize month from sessionStorage on mount
  useEffect(() => {
    const month = sessionStorage.getItem('selectedMonth')
    if (month) {
      setSelectedMonth(month)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/add-transaction', label: 'Add Transaction', icon: '➕' },
    { path: '/assets', label: 'Assets', icon: '💼' }
  ]

  const getMonths = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      months.push({ value: `${year}-${month}`, label: monthName })
    }
    return months
  }

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">💰</span>
          <span className="logo-text">FinanceApp</span>
        </div>
        {user && (
          <div className="user-info">
            <div className="user-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="user-details">
              <div className="user-name">{user.name || 'User'}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-month-selector">
        <label className="month-selector-label">
          <span className="month-icon">📅</span>
          Select Month
        </label>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="month-select"
        >
          {getMonths().map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="logout-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
    <button 
      className="sidebar-toggle" 
      onClick={toggleSidebar}
      aria-label={isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {isCollapsed ? (
          <path d="M9 18l6-6-6-6" />
        ) : (
          <path d="M15 18l-6-6 6-6" />
        )}
      </svg>
    </button>
    </>
  )
}

