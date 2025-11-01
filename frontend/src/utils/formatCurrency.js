// Utility function to format currency in Indian Rupees (₹)
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}

// Format currency without symbol (just number with comma separators)
export const formatAmount = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}

// Format currency with rupee symbol prefix (simple format)
export const formatRupee = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0'
  }
  return `₹${formatAmount(value)}`
}

