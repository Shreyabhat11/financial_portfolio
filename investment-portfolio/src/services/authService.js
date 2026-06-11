import api from '../api/axios'

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { accessToken, user } = res.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    return user
  },

  // Register now returns token directly — no second login needed
  register: async (data) => {
    const res = await api.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    })
    const { accessToken, user } = res.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    return user
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  },

  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}
