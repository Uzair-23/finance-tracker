import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import AddTransaction from './pages/AddTransaction'
import Assets from './pages/Assets'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'

function App() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="app-root">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    )
  }
  
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })

  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebarCollapsed')
      setSidebarCollapsed(saved === 'true')
    }
    window.addEventListener('storage', handleStorageChange)
    // Also check on interval for same-tab changes
    const interval = setInterval(() => {
      const saved = localStorage.getItem('sidebarCollapsed')
      const savedBool = saved === 'true'
      if (savedBool !== sidebarCollapsed) {
        setSidebarCollapsed(savedBool)
      }
    }, 100)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [sidebarCollapsed])

  return (
    <div className={`app-root ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar onToggle={setSidebarCollapsed} initialCollapsed={sidebarCollapsed} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-transaction" element={<AddTransaction />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App