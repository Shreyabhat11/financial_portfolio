import api from '../api/axios'

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getMarketOverview: () => api.get('/dashboard/market-overview'),
  getTopMovers: () => api.get('/dashboard/top-movers'),
}

export const portfolioService = {
  getPortfolio: () => api.get('/portfolio/'),
  getHoldings: () => api.get('/portfolio/holdings'),
  getPerformance: () => api.get('/portfolio/performance'),
  addHolding: (data) => api.post('/portfolio/add-holding', data),
}

export const marketService = {
  getStocks: (params) => api.get('/market/stocks', { params }),
  getTrending: () => api.get('/market/trending'),
  getNews: () => api.get('/market/news'),
  searchStocks: (query) => api.get('/market/search', { params: { q: query } }),
  getStock: (symbol) => api.get(`/market/stock/${symbol}`),
}

export const watchlistService = {
  getWatchlist: () => api.get('/watchlist/'),
  // Backend schema: { stock_symbol: string }
  addStock: (symbol) => api.post('/watchlist/add', { stock_symbol: symbol }),
  removeStock: (id) => api.delete(`/watchlist/remove/${id}`),
}

export const aiService = {
  getRecommendations: () => api.get('/ai/recommendations'),
  getRiskAnalysis: () => api.get('/ai/risk-analysis'),
  getSentiment: () => api.get('/ai/sentiment'),
  analyzeStock: (symbol) => api.get(`/ai/analyze/${symbol}`),
}

export const alertsService = {
  getAlerts: () => api.get('/alerts/'),
  // Backend schema: { stock_symbol, condition_type, condition_value }
  createAlert: (data) => api.post('/alerts/create', {
    stock_symbol: data.symbol,
    condition_type: data.type,
    condition_value: parseFloat(data.price),
  }),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  updateAlert: (id, data) => api.put(`/alerts/${id}`, data),
}

export const brokersService = {
  getBrokers: () => api.get('/brokers/'),
  connectBroker: (data) => api.post('/brokers/connect', {
    broker_name: data.broker_name,
    api_key: data.api_key,
    api_secret: data.api_secret || '',
  }),
  disconnectBroker: (id) => api.delete(`/brokers/${id}`),
}

export const settingsService = {
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data) => api.put('/settings/profile', data),
  updatePassword: (data) => api.put('/settings/password', data),
  getNotificationPrefs: () => api.get('/settings/notifications'),
}
