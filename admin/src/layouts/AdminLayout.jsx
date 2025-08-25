import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AdminAPI } from '../utils/axiosInstance'

const nav = [
	{ to: '/admin', label: 'Dashboard' },
	{ to: '/admin/users', label: 'Users' },
	{ to: '/admin/jobs', label: 'Jobs' },
	{ to: '/admin/resources', label: 'Resources' },
	{ to: '/admin/mentors', label: 'Mentors' },
	{ to: '/admin/mentor-applications', label: 'Mentor Applications' },
	{ to: '/admin/reports', label: 'Reports' },
	{ to: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout() {
	const navigate = useNavigate()
	const logout = async () => {
		try { await AdminAPI.logout() } catch {} finally { navigate('/admin/login', { replace:true }) }
	}
	return (
		<div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr] bg-gray-50">
			<aside className="bg-white border-r">
				<div className="h-14 border-b px-4 flex items-center font-semibold">SkillSync Admin</div>
				<nav className="p-3 space-y-1">
					{nav.map((n) => (
						<NavLink key={n.to} to={n.to} end className={({isActive})=>`block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-sky-50 text-sky-700' : 'hover:bg-gray-50'}`}>{n.label}</NavLink>
					))}
				</nav>
			</aside>
			<div className="flex flex-col">
				<header className="h-14 bg-white border-b flex items-center justify-between px-4">
					<input className="w-72 max-w-[50vw] hidden md:block px-3 py-1.5 text-sm rounded-lg border bg-gray-50" placeholder="Search..." />
					<div className="flex items-center gap-3">
						<button onClick={logout} className="px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-gray-50">Logout</button>
						<div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600" />
					</div>
				</header>
				<main className="p-4">
					<Outlet />
				</main>
			</div>
		</div>
	)
}
