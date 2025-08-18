import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export const AuthAPI = {
  me: () => api.get('/auth/me'),
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
}
