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
	mentors: (params) => api.get('/admin/mentors', { params }),
	createMentor: (data) => api.post('/admin/mentors', data),
	updateMentor: (userId, data) => api.put(`/admin/mentors/${userId}`, data),
	approveMentor: (userId, approved) => api.patch(`/admin/mentors/${userId}/approve`, { approved }),
	deleteMentor: (userId) => api.delete(`/admin/mentors/${userId}`),
	mentorApplications: (params) => api.get('/admin/mentor-applications', { params }),
	approveMentorApplication: (id, password) => api.post(`/admin/mentor-applications/${id}/approve`, { password }),
	rejectMentorApplication: (id, notes) => api.post(`/admin/mentor-applications/${id}/reject`, { notes }),
	updateSettings: (data) => api.patch('/admin/settings', data),
	logout: () => api.post('/auth/logout'),
}
