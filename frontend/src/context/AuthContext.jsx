import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('fm_user');
    return raw ? JSON.parse(raw) : null;
  })
  const [token, setToken] = useState(() => localStorage.getItem('fm_token'))

  useEffect(() => {
    if (token) api.setToken(token)
  }, [token])

  const login = (data) => {
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('fm_token', data.token)
    localStorage.setItem('fm_user', JSON.stringify(data.user))
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('fm_user', JSON.stringify(updatedUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('fm_token')
    localStorage.removeItem('fm_user')
    api.setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)