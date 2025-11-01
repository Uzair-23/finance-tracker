import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { formatRupee } from '../utils/formatCurrency'

export default function MarketOverview(){
  const [bestStocks, setBestStocks] = useState([])
  const [marketTrends, setMarketTrends] = useState([])
  const [popularStocks, setPopularStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = async ()=>{
      setLoading(true)
      
      // Load all data in parallel
      const [gainersRes, trendsRes, popularRes] = await Promise.allSettled([
        api.get('/external/market/gainers').catch(() => ({ data: [] })),
        api.get('/external/market/trends').catch(() => ({ data: [] })),
        api.get('/external/market/popular').catch(() => ({ data: [] }))
      ])
      
      // Set best stocks
      if (gainersRes.status === 'fulfilled') {
        setBestStocks(gainersRes.value.data || [])
      } else {
        console.error('gainers error', gainersRes.reason)
        setBestStocks([])
      }
      
      // Set market trends
      if (trendsRes.status === 'fulfilled') {
        setMarketTrends(trendsRes.value.data || [])
      } else {
        console.error('trends error', trendsRes.reason)
        setMarketTrends([])
      }
      
      // Set popular stocks
      if (popularRes.status === 'fulfilled') {
        setPopularStocks(popularRes.value.data || [])
      } else {
        console.error('popular error', popularRes.reason)
        setPopularStocks([])
      }
      
      setLoading(false)
    }
    load()
  },[])

  const formatPrice = (price) => {
    if (!price) return '₹0'
    return formatRupee(price)
  }

  const getChangeColor = (change) => {
    if (!change) return 'var(--text)'
    return change >= 0 ? '#43e97b' : '#fa709a'
  }

  const getChangeSymbol = (change) => {
    if (!change) return ''
    return change >= 0 ? '▲' : '▼'
  }

  return (
    <div className="chart-card">
      <h4>Market Overview</h4>
      
      {loading ? (
        <div style={{padding: '1rem', textAlign: 'center', color: 'var(--text-light)'}}>Loading market data...</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem'}}>
          {/* Market Trends - Major Indices - Grid Layout */}
          {marketTrends.length > 0 && (
            <div>
              <h5 style={{fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Market Indices</h5>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem'
              }}>
                {marketTrends.map((index, i) => (
                  <div key={i} style={{
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '80px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  >
                    <div style={{fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.5rem'}}>
                      {index.name || index.symbol}
                    </div>
                    <div style={{fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.25rem'}}>
                      {formatPrice(index.c)}
                    </div>
                    {index.change && (
                      <div style={{fontSize: '0.75rem', color: getChangeColor(index.change)}}>
                        {getChangeSymbol(index.change)} {Math.abs(index.changePercent || 0).toFixed(2)}% ({formatPrice(index.change)})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Performing Stocks - Grid Layout */}
          {bestStocks.length > 0 && (
            <div>
              <h5 style={{fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Top Gainers</h5>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem'
              }}>
                {bestStocks.slice(0, 10).map((stock, i) => (
                  <div key={i} style={{
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(67, 233, 123, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '90px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(67, 233, 123, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  >
                    <div>
                      <div style={{fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.25rem'}}>
                        {(stock.description || stock.symbol || '').length > 20 
                          ? (stock.description || stock.symbol || '').substring(0, 20) + '...'
                          : (stock.description || stock.symbol || 'N/A')}
                      </div>
                      {stock.changePercent && (
                        <div style={{fontSize: '0.75rem', color: '#43e97b', fontWeight: '600'}}>
                          ▲ +{Math.abs(stock.changePercent).toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <div style={{marginTop: '0.5rem'}}>
                      <div style={{fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-dark)'}}>
                        {formatPrice(stock.close || stock.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Stocks - Grid Layout */}
          {popularStocks.length > 0 && (
            <div>
              <h5 style={{fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Popular Stocks</h5>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem'
              }}>
                {popularStocks.slice(0, 10).map((stock, i) => (
                  <div key={i} style={{
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(102, 126, 234, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '90px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  >
                    <div>
                      <div style={{fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.25rem'}}>
                        {(stock.name || stock.symbol || 'N/A').length > 20 
                          ? (stock.name || stock.symbol || 'N/A').substring(0, 20) + '...'
                          : (stock.name || stock.symbol || 'N/A')}
                      </div>
                      {stock.dp !== undefined && stock.dp !== null && (
                        <div style={{fontSize: '0.75rem', color: getChangeColor(stock.dp), fontWeight: '600'}}>
                          {getChangeSymbol(stock.dp)} {Math.abs(stock.dp).toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <div style={{marginTop: '0.5rem'}}>
                      <div style={{fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-dark)'}}>
                        {formatPrice(stock.c || stock.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {marketTrends.length === 0 && bestStocks.length === 0 && popularStocks.length === 0 && (
            <div style={{padding: '1rem', textAlign: 'center', color: 'var(--text-light)'}}>
              No market data available. Please check API configuration.
            </div>
          )}
        </div>
      )}
    </div>
  )
}