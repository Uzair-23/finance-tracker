import React, { useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try{
      const r = await api.post('/auth/register', { name, email, password })
      login(r.data)
      nav('/')
    }catch(err){
      alert(err.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div className="auth-form">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          placeholder="Name" 
          required 
        />
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
        <button type="submit">Register</button>
      </form>
    </div>
  )
}