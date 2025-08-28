import { useEffect, useState } from 'react'
import { AdminAPI } from '../utils/axiosInstance'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
	const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalResources: 0, activeSessions: 0, roles:{user:0, mentor:0, admin:0}, totalMentors:0 })
	const [loading, setLoading] = useState(true)
	useEffect(() => {
		AdminAPI.stats().then(({data})=> setStats(data)).finally(()=>setLoading(false))
	}, [])
	return (
		<div className="space-y-6">
			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ label: 'Total Users', value: stats.totalUsers },
					{ label: 'Job Postings', value: stats.totalJobs },
					{ label: 'Resources', value: stats.totalResources },
					{ label: 'Active Sessions', value: stats.activeSessions },
				].map((c)=> (
					<div key={c.label} className="rounded-2xl border bg-white p-4">
						<p className="text-sm text-gray-500">{c.label}</p>
						<p className="text-2xl font-semibold mt-1">{loading ? '—' : c.value}</p>
					</div>
				))}
			</div>
			<div className="grid lg:grid-cols-3 gap-6">
				<div className="rounded-2xl border bg-white p-4 flex flex-col">
					<p className="font-semibold mb-3">Users by Role</p>
					<div className="flex-1 min-h-[220px]">
						{stats.totalUsers === 0 ? <div className="h-full grid place-items-center text-xs text-gray-400">No data</div> : (
							<ResponsiveContainer width="100%" height={220}>
								<PieChart>
									<Pie data={[
										{ name: 'Users', value: stats.roles.user },
										{ name: 'Mentors', value: stats.roles.mentor },
										{ name: 'Admins', value: stats.roles.admin },
									]} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
										{['#0ea5e9','#6366f1','#f59e0b'].map((c,i)=><Cell key={i} fill={c} />)}
									</Pie>
									<Tooltip />
									<Legend verticalAlign="bottom" height={24} />
								</PieChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>
				<div className="rounded-2xl border bg-white p-4 flex flex-col">
					<p className="font-semibold mb-3">Content Distribution</p>
					<div className="flex-1 min-h-[220px]">
						{(stats.totalJobs+stats.totalResources+stats.totalMentors) === 0 ? <div className="h-full grid place-items-center text-xs text-gray-400">No data</div> : (
							<ResponsiveContainer width="100%" height={220}>
								<PieChart>
									<Pie data={[
										{ name: 'Jobs', value: stats.totalJobs },
										{ name: 'Resources', value: stats.totalResources },
										{ name: 'Mentors', value: stats.totalMentors },
									]} dataKey="value" nameKey="name" outerRadius={80}>
										{['#10b981','#0ea5e9','#6366f1'].map((c,i)=><Cell key={i} fill={c} />)}
									</Pie>
									<Tooltip />
									<Legend verticalAlign="bottom" height={24} />
								</PieChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>
				<div className="rounded-2xl border bg-white p-4 flex flex-col">
					<p className="font-semibold mb-3">Highlights</p>
					<ul className="text-xs text-gray-600 space-y-1 mt-1">
						<li><span className="font-medium">{stats.roles.mentor||0}</span> mentors active</li>
						<li><span className="font-medium">{stats.roles.admin||0}</span> admins</li>
						<li><span className="font-medium">{stats.totalJobs}</span> job postings</li>
						<li><span className="font-medium">{stats.totalResources}</span> learning resources</li>
					</ul>
				</div>
			</div>
		</div>
	)
}
