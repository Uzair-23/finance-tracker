import React, { useEffect, useState } from 'react'
import api from '../utils/api'

export default function InsightsWidget(){
  const [tips, setTips] = useState([])
  const [news, setNews] = useState(null)

  useEffect(()=>{
    const load = async ()=>{
      try{
        const r = await api.get('/external/advice')
        setTips(r.data || [])
      }catch(err){ console.error('advice', err) }
      try{
        const n = await api.get('/external/news?q=finance')
        setNews(n.data)
      }catch(err){ console.error('news', err) }
    }
    load()
  },[])

  return (
    <div className="chart-card">
      <h4>Community Insights</h4>
      <div>
        <h5>Tips</h5>
        <ul>
          {tips.length ? tips.slice(0,5).map((t,i)=> (
            <li key={i}>{t.quote || t}</li>
          )) : <li>No tips available</li>}
        </ul>
      </div>
      <div>
        <h5>News</h5>
        {news?.results ? (
          <ul>
            {news.results.slice(0,5).map((nn,i)=> (
              <li key={i}>
                <a href={nn.link} target="_blank" rel="noreferrer">{nn.title}</a>
              </li>
            ))}
          </ul>
        ) : <div>No news</div>}
      </div>
    </div>
  )
}