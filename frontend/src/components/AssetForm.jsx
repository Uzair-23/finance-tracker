import React, { useState } from 'react'
import api from '../utils/api'

export default function AssetForm({ onSaved, existingAsset = null }) {
  const [asset, setAsset] = useState({
    name: '',
    type: 'real_estate',
    value: '',
    description: '',
    appreciation: 0,
    ...existingAsset
  })

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (existingAsset) {
        await api.put(`/assets/${existingAsset._id}`, asset)
      } else {
        await api.post('/assets', asset)
      }
      onSaved()
      if (!existingAsset) {
        setAsset({ name: '', type: 'real_estate', value: '', description: '', appreciation: 0 })
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save asset')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setAsset(prev => ({
      ...prev,
      [name]: name === 'value' || name === 'appreciation' ? Number(value) : value
    }))
  }

  return (
    <div className="asset-form card">
      <h3>{existingAsset ? 'Edit Asset' : 'Add New Asset'}</h3>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Asset Name</label>
          <input
            name="name"
            value={asset.name}
            onChange={handleChange}
            placeholder="e.g., House, Car, Stocks"
            required
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select name="type" value={asset.type} onChange={handleChange} required>
            <option value="real_estate">Real Estate</option>
            <option value="vehicle">Vehicle</option>
            <option value="investment">Investment</option>
            <option value="savings">Savings</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Value</label>
          <input
            name="value"
            type="number"
            value={asset.value}
            onChange={handleChange}
            placeholder="Current value"
            required
          />
        </div>

        <div className="form-group">
          <label>Annual Appreciation (%)</label>
          <input
            name="appreciation"
            type="number"
            value={asset.appreciation}
            onChange={handleChange}
            placeholder="Expected annual appreciation"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={asset.description}
            onChange={handleChange}
            placeholder="Additional details"
          />
        </div>

        <button type="submit" className="btn-primary">
          {existingAsset ? 'Update Asset' : 'Add Asset'}
        </button>
      </form>
    </div>
  )
}