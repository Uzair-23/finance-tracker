import React, { useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try{
      const r = await api.post('/auth/login', { email, password })
      login(r.data)
      nav('/')
    }catch(err){
      alert(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          placeholder="Email" 
          required 
        />
        <input 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          type="password" 
          placeholder="Password" 
          required 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}