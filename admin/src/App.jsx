import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import JobManagement from './pages/JobManagement'
import ResourceManagement from './pages/ResourceManagement'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import AdminLogin from './pages/Login'

function RequireAdmin({ children }) {
	// TODO: wire to real admin auth; for now assume backend protects routes
	return children
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
			<Route path="/admin/login" element={<AdminLogin />} />
			<Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
					<Route index element={<Dashboard />} />
					<Route path="users" element={<UserManagement />} />
					<Route path="jobs" element={<JobManagement />} />
					<Route path="resources" element={<ResourceManagement />} />
					<Route path="reports" element={<Logs />} />
					<Route path="settings" element={<Settings />} />
				</Route>
				<Route path="*" element={<Navigate to="/admin" replace />} />
			</Routes>
		</BrowserRouter>
	)
}
