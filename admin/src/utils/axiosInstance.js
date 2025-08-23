import axios from 'axios'

const base = import.meta.env.VITE_API_BASE || '/api'

export const api = axios.create({
	baseURL: base,
	withCredentials: true,
})

export const AdminAPI = {
	stats: () => api.get('/admin/stats'),
	users: (params) => api.get('/admin/users', { params }),
	changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
	suspendUser: (id, suspended) => api.patch(`/admin/users/${id}/suspend`, { suspended }),
	deleteUser: (id) => api.delete(`/admin/users/${id}`),
	jobs: (params) => api.get('/admin/jobs', { params }),
	createJob: (data) => api.post('/admin/jobs', data),
	updateJob: (id, data) => api.put(`/admin/jobs/${id}`, data),
	deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
	resources: (params) => api.get('/admin/resources', { params }),
	createResource: (data) => api.post('/admin/resources', data),
	updateResource: (id, data) => api.put(`/admin/resources/${id}`, data),
	deleteResource: (id) => api.delete(`/admin/resources/${id}`),
	logs: (params) => api.get('/admin/logs', { params }),
}
