// Number formatting
export const formatCurrency = (val, currency = '₹') =>
  `${currency}${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

export const formatPercent = (val, showSign = true) => {
  const n = parseFloat(val)
  const sign = showSign && n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export const formatLargeNumber = (n) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`
  return `₹${n}`
}

// Date formatting
export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

export const timeAgo = (d) => {
  const secs = Math.floor((Date.now() - new Date(d)) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

// Color helpers
export const getPnlColor = (val) => parseFloat(val) >= 0 ? '#00c853' : '#ff5252'
export const getPnlClass = (val) => parseFloat(val) >= 0 ? 'text-success' : 'text-danger'
export const getSignalClass = (s) => ({ BUY: 'tag-buy', SELL: 'tag-sell', HOLD: 'tag-hold' }[s] || 'tag-hold')

// Validation
export const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
export const isStrongPassword = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)
