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
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-bg)', backgroundAttachment: 'fixed', padding: '2rem'}}>
      <div className="auth-form">
        <h2 style={{background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Welcome Back</h2>
        <p style={{textAlign: 'center', color: 'var(--text-light)', marginBottom: '1.5rem'}}>Sign in to your account</p>
        <form onSubmit={submit}>
          <input 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            placeholder="Email" 
            type="email"
            required 
          />
          <input 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            type="password" 
            placeholder="Password" 
            required 
          />
          <button type="submit" className="btn-primary btn-block">Login</button>
        </form>
      </div>
    </div>
  )
}