import React, { useMemo, useState } from 'react'
import { Line, Pie, Bar } from 'react-chartjs-2'
import { 
  Chart, CategoryScale, LinearScale, PointElement, 
  LineElement, ArcElement, BarElement, Title, 
  Tooltip, Legend 
} from 'chart.js'

Chart.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  ArcElement, BarElement, Title, Tooltip, Legend
)

function groupByMonth(txs){
  const map = {}
  txs.forEach(t=>{
    const d = new Date(t.date)
    const key = d.getFullYear() + '-' + (d.getMonth()+1)
    map[key] = (map[key]||0) + (t.type==='expense' ? -t.amount : t.amount)
  })
  const labels = Object.keys(map).sort()
  return { labels, data: labels.map(l=>map[l]) }
}

export default function Charts({ transactions }){
  const [range, setRange] = useState('monthly')

  const { line, pie, bar } = useMemo(()=>{
    // line: monthly totals
    const grouped = groupByMonth(transactions)
    const income = transactions
      .filter(t=>t.type==='income')
      .reduce((s,t)=>s+t.amount,0)
    const expense = transactions
      .filter(t=>t.type==='expense')
      .reduce((s,t)=>s+t.amount,0)
    const categories = {}
    transactions.forEach(t=>{ 
      categories[t.category] = (categories[t.category]||0) + t.amount 
    })
    const barLabels = Object.keys(categories)
    const barData = barLabels.map(l=>categories[l])

    return {
      line: {
        labels: grouped.labels,
        datasets:[{
          label: 'Net',
          data: grouped.data,
          borderColor: '#1976d2',
          tension:0.3
        }]
      },
      pie: {
        labels: ['Income','Expense'],
        datasets:[{
          data: [income, expense],
          backgroundColor:['#4caf50','#f44336']
        }]
      },
      bar: {
        labels: barLabels,
        datasets:[{
          label: 'By Category',
          data: barData,
          backgroundColor:'#1976d2'
        }]
      }
    }
  }, [transactions])

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h4>Spending Trend</h4>
          <div>
            <select value={range} onChange={e=>setRange(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <Line data={line} />
      </div>

      <div className="chart-card">
        <h4>Income vs Expense</h4>
        <Pie data={pie} />
      </div>

      <div className="chart-card" style={{gridColumn:'1 / -1'}}>
        <h4>Category Breakdown</h4>
        <Bar data={bar} />
      </div>
    </div>
  )
}