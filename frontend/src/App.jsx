import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

function App() {
  const { user } = useAuth();
  
  return (
    <div className="app-root">
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App