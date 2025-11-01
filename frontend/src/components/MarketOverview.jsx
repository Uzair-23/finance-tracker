import React, { useEffect, useState } from 'react'
import api from '../utils/api'

export default function MarketOverview(){
  const [quote, setQuote] = useState(null)
  const [rates, setRates] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      try{
        const q = await api.get('/external/market/quote?symbol=BTCUSDT')
        setQuote(q.data)
      }catch(err){ console.error('quote', err) }
      try{
        const r = await api.get('/external/market/rates')
        setRates(r.data)
      }catch(err){ console.error('rates', err) }
    }
    load()
  },[])

  return (
    <div className="chart-card">
      <h4>Market Overview</h4>
      {quote ? (
        <div>
          <div><strong>BTC</strong> Current: {quote.c} | High: {quote.h} | Low: {quote.l}</div>
        </div>
      ) : <div>Loading market quote...</div>}

      {rates ? (
        <div style={{marginTop:8}}>
          <h5>Exchange Rates (sample)</h5>
          <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(rates, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}