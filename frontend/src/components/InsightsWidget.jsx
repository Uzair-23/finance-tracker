import React, { useEffect, useState } from 'react'
import api from '../utils/api'

export default function InsightsWidget(){
  const [tips, setTips] = useState([])
  const [news, setNews] = useState(null)
  const [loadingTips, setLoadingTips] = useState(true)
  const [loadingNews, setLoadingNews] = useState(true)

  useEffect(()=>{
    const load = async ()=>{
      // Load financial tips from API Ninjas
      setLoadingTips(true)
      try{
        const r = await api.get('/external/advice')
        setTips(r.data || [])
      }catch(err){ 
        console.error('advice', err)
        setTips([])
      } finally {
        setLoadingTips(false)
      }
      
      // Load finance news from NewsData.io
      setLoadingNews(true)
      try{
        const n = await api.get('/external/news?category=finance')
        setNews(n.data)
      }catch(err){ 
        console.error('news', err)
        setNews(null)
      } finally {
        setLoadingNews(false)
      }
    }
    load()
  },[])

  return (
    <div className="chart-card">
      <h4>Community Insights</h4>
      <div style={{marginTop: '1rem'}}>
        <h5 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-dark)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>💡 Financial Tips</h5>
        {loadingTips ? (
          <div style={{padding: '0.75rem', color: 'var(--text-light)', fontSize: '0.875rem', textAlign: 'center'}}>Loading tips...</div>
        ) : tips.length > 0 ? (
          <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {tips.slice(0, 5).map((t, i) => (
              <li key={i} style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(102, 126, 234, 0.15)',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                transition: 'all 0.3s',
                cursor: 'default',
                position: 'relative',
                paddingLeft: '2.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <span style={{position: 'absolute', left: '0.75rem', fontSize: '1rem'}}>💡</span>
                <div style={{fontStyle: 'italic', color: 'var(--text)', marginBottom: '0.25rem'}}>
                  "{t.quote || t.text || t}"
                </div>
                {t.author && (
                  <div style={{fontSize: '0.75rem', color: 'var(--text-light)', fontStyle: 'normal'}}>
                    — {t.author}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{padding: '0.75rem', color: 'var(--text-light)', fontSize: '0.875rem', textAlign: 'center'}}>
            No tips available. Please check API configuration.
          </div>
        )}
      </div>
      <div style={{marginTop: '1.5rem'}}>
        <h5 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-dark)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>📰 Finance News</h5>
        {loadingNews ? (
          <div style={{padding: '0.75rem', color: 'var(--text-light)', fontSize: '0.875rem', textAlign: 'center'}}>Loading news...</div>
        ) : news?.results && news.results.length > 0 ? (
          <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto'}}>
            {news.results.slice(0, 5).map((nn, i) => (
              <li key={i} style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(102, 126, 234, 0.15)',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <a 
                  href={nn.link || nn.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{
                    color: 'var(--text-dark)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    display: 'block'
                  }}
                >
                  <div style={{fontWeight: '600', marginBottom: '0.25rem'}}>{nn.title}</div>
                  {nn.description && (
                    <div style={{fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem'}}>
                      {nn.description.substring(0, 100)}...
                    </div>
                  )}
                  {nn.pubDate && (
                    <div style={{fontSize: '0.7rem', color: 'var(--text-lighter)', marginTop: '0.25rem'}}>
                      {new Date(nn.pubDate).toLocaleDateString()}
                    </div>
                  )}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{padding: '0.75rem', color: 'var(--text-light)', fontSize: '0.875rem', textAlign: 'center'}}>
            No news available. Please check API configuration.
          </div>
        )}
      </div>
    </div>
  )
}