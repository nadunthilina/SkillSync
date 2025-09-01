import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import { api } from './utils/axiosInstance'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import JobManagement from './pages/JobManagement'
import ResourceManagement from './pages/ResourceManagement'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import AdminLogin from './pages/Login'
import AdminRegister from './pages/Register'
import MentorManagement from './pages/MentorManagement'
import MentorApplications from './pages/MentorApplications'

import { useEffect, useState } from 'react'

function RequireAdmin({ children }) {
	const [state, setState] = useState({ loading: true, ok: false })
	useEffect(()=>{ (async()=>{
		try {
			const { data } = await api.get('/auth/me')
			if (data.user?.role === 'admin') setState({ loading:false, ok:true })
			else setState({ loading:false, ok:false })
		} catch { setState({ loading:false, ok:false }) }
	})() }, [])
	if (state.loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Checking session…</div>
	if (!state.ok) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-sm"><p className="text-gray-600">Not authorized.</p><a className="px-4 py-2 rounded bg-sky-600 text-white" href="/admin/login">Admin Login</a></div>
	return children
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/admin/register" element={<AdminRegister />} />
			<Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
					<Route index element={<Dashboard />} />
					<Route path="users" element={<UserManagement />} />
					<Route path="jobs" element={<JobManagement />} />
					<Route path="resources" element={<ResourceManagement />} />
					<Route path="mentors" element={<MentorManagement />} />
					<Route path="mentor-applications" element={<MentorApplications />} />
					<Route path="reports" element={<Logs />} />
					<Route path="settings" element={<Settings />} />
				</Route>
				<Route path="*" element={<Navigate to="/admin" replace />} />
			</Routes>
		</BrowserRouter>
	)
}
