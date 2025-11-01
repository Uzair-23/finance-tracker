import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import AssetForm from '../components/AssetForm'
import AssetsTable from '../components/AssetsTable'
import Toast from '../components/Toast'

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [assetToEdit, setAssetToEdit] = useState(null)
  const [toast, setToast] = useState(null)

  const loadAssets = async () => {
    try {
      const res = await api.get('/assets')
      setAssets(res.data)
    } catch (err) {
      console.error(err)
      setToast('Failed to load assets')
    }
  }

  const deleteAsset = async (id) => {
    if (!confirm('Delete this asset?')) return
    try {
      await api.delete(`/assets/${id}`)
      loadAssets()
      setToast('Asset deleted successfully')
    } catch (err) {
      setToast('Failed to delete asset')
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Assets Management</h1>
        <p>Track and manage your financial assets</p>
      </div>
      
      <div className="assets-content">
        <AssetForm 
          onSaved={() => {
            loadAssets()
            setAssetToEdit(null)
            setToast('Asset saved successfully!')
          }}
          existingAsset={assetToEdit}
        />
        <AssetsTable 
          assets={assets}
          onEdit={setAssetToEdit}
          onDelete={deleteAsset}
        />
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  )
}

