import React, { useMemo, useState } from 'react'
import { Line, Pie } from 'react-chartjs-2'
import { 
  Chart, CategoryScale, LinearScale, PointElement, 
  LineElement, ArcElement, Title, 
  Tooltip, Legend 
} from 'chart.js'

Chart.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  ArcElement, Title, Tooltip, Legend
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

  const { line, pie } = useMemo(()=>{
    // Create gradient colors for charts
    const createGradient = (ctx, color1, color2, height = 400) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      return gradient
    }

    // Create canvas context for gradients
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 400
    const ctx = canvas.getContext('2d')

    // line: monthly totals
    const grouped = groupByMonth(transactions)
    const income = transactions
      .filter(t=>t.type==='income')
      .reduce((s,t)=>s+t.amount,0)
    const expense = transactions
      .filter(t=>t.type==='expense')
      .reduce((s,t)=>s+t.amount,0)

    // Modern gradient colors
    const chartColors = {
      primary: '#667eea',
      primaryLight: '#764ba2',
      secondary: '#f093fb',
      secondaryLight: '#f5576c',
      success: '#4facfe',
      successLight: '#00f2fe',
      danger: '#fa709a',
      dangerLight: '#fee140',
      income: '#43e97b',
      incomeLight: '#38f9d7',
      expense: '#fa709a',
      expenseLight: '#fee140'
    }

    return {
      line: {
        labels: grouped.labels,
        datasets:[{
          label: 'Net Balance',
          data: grouped.data,
          borderColor: chartColors.primary,
          backgroundColor: createGradient(ctx, chartColors.primary + '20', chartColors.primaryLight + '10'),
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: chartColors.primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: chartColors.primaryLight,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3
        }]
      },
      pie: {
        labels: ['Income','Expense'],
        datasets:[{
          data: [income, expense],
          backgroundColor: [
            chartColors.income,
            chartColors.expense
          ],
          borderWidth: 3,
          borderColor: '#fff',
          hoverBorderWidth: 5,
          hoverOffset: 10
        }]
      }
    }
  }, [transactions])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(102, 126, 234, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6
      }
    }
  }

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', marginBottom: '1rem'}}>
          <h4>Spending Trend</h4>
          <select 
            value={range} 
            onChange={e=>setRange(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'
              e.target.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <Line data={line} options={chartOptions} />
      </div>

      <div className="chart-card">
        <h4>Income vs Expense</h4>
        <Pie data={pie} options={pieOptions} />
      </div>
    </div>
  )
}