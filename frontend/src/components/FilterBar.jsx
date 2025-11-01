import React, { useState } from 'react'

export default function FilterBar({ onFilter, categories = [] }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [category, setCategory] = useState('')

  const apply = (e) => {
    e.preventDefault()
    const filters = {}
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate
    if (category) filters.category = category
    onFilter(filters)
  }

  const reset = () => {
    setStartDate('')
    setEndDate('')
    setCategory('')
    onFilter({}) // Clear filters
  }

  return (
    <div className="filter-bar">
      <form onSubmit={apply}>
        <div className="filter-inputs">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button type="submit" className="btn-primary">Apply Filters</button>
            <button type="button" className="btn-secondary" onClick={reset}>Reset</button>
          </div>
        </div>
      </form>
    </div>
  )
}