import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useAuth()
  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/">FinanceApp</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span className="nav-user">{user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}