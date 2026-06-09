import api from '../api/axios'

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getMarketOverview: () => api.get('/dashboard/market-overview'),
  getTopMovers: () => api.get('/dashboard/top-movers'),
  getNews: () => api.get('/dashboard/news'),
}

export const portfolioService = {
  getPortfolio: () => api.get('/portfolio/'),
  getHoldings: () => api.get('/portfolio/holdings'),
  getPerformance: () => api.get('/portfolio/performance'),
  addHolding: (data) => api.post('/portfolio/add-holding', data),
}

export const marketService = {
  getStocks: () => api.get('/market/stocks'),
  getTrending: () => api.get('/market/trending'),
  getNews: () => api.get('/market/news'),
  searchStocks: (q) => api.get('/market/search', { params: { q } }),
  getStock: (symbol) => api.get(`/market/stock/${symbol}`),
  getStockHistory: (symbol, period = '1mo') => api.get(`/market/stock/${symbol}/history`, { params: { period } }),
  getIndices: () => api.get('/market/indices'),
  getTopMovers: () => api.get('/market/top-movers'),
}

export const watchlistService = {
  getWatchlist: () => api.get('/watchlist/'),
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
  createAlert: (data) => api.post('/alerts/create', {
    stock_symbol: data.symbol,
    condition_type: data.type,
    condition_value: parseFloat(data.price),
  }),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
}

export const brokersService = {
  getBrokers: () => api.get('/brokers/'),
  disconnectBroker: (id) => api.delete(`/brokers/${id}`),
  getBrokerHoldings: (id) => api.get(`/brokers/${id}/holdings`),
  getBrokerFunds: (id) => api.get(`/brokers/${id}/funds`),
  getZerodhaLoginUrl: () => api.get('/brokers/zerodha/login-url'),
  getUpstoxLoginUrl: () => api.get('/brokers/upstox/login-url'),
  placeOrder: (data) => api.post('/brokers/order/place', data),
}

export const settingsService = {
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data) => api.put('/settings/profile', data),
  updatePassword: (data) => api.put('/settings/password', data),
  getNotificationPrefs: () => api.get('/settings/notifications'),
}
