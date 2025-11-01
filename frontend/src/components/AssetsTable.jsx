import React from 'react'
import { formatCurrency } from '../utils/formatCurrency'

export default function AssetsTable({ assets, onEdit, onDelete }) {

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const formatType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="assets-table card">
      <h3>Your Assets</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Value</th>
            <th>Appreciation</th>
            <th>Added Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(asset => (
            <tr key={asset._id}>
              <td>{asset.name}</td>
              <td>{formatType(asset.type)}</td>
              <td>{formatCurrency(asset.value)}</td>
              <td>{asset.appreciation}%</td>
              <td>{formatDate(asset.createdAt)}</td>
              <td>
                <button 
                  onClick={() => onEdit(asset)} 
                  className="btn-secondary btn-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(asset._id)}
                  className="btn-danger btn-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2"><strong>Total Value:</strong></td>
            <td colSpan="4">
              <strong>
                {formatCurrency(assets.reduce((sum, a) => sum + a.value, 0))}
              </strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}