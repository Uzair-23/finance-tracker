import React from 'react'

export default function Toast({ message, onClose }){
  if (!message) return null
  return (
    <div style={{
      position:'fixed',
      right:20,
      top:20,
      background:'#333',
      color:'#fff',
      padding:'10px 14px',
      borderRadius:6,
      zIndex:999
    }}>
      <div>{message}</div>
      <div style={{textAlign:'right',marginTop:6}}>
        <button 
          onClick={onClose} 
          style={{background:'transparent',color:'#fff',border:0}}
        >
          Close
        </button>
      </div>
    </div>
  )
}