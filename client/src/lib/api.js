import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
})

export const AuthAPI = {
  me: () => api.get('/auth/me'),
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
}
