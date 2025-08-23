import { useEffect, useState } from 'react'
import { AdminAPI } from '../utils/axiosInstance'

export default function Dashboard() {
	const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalResources: 0, activeSessions: 0 })
	const [loading, setLoading] = useState(true)
	useEffect(() => {
		AdminAPI.stats().then(({data})=> setStats(data)).finally(()=>setLoading(false))
	}, [])
	return (
		<div className="space-y-4">
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
			<div className="rounded-2xl border bg-white p-4">
				<p className="font-semibold mb-2">Trends</p>
				<div className="h-56 grid place-items-center text-gray-400 text-sm">[Add Chart.js/Recharts here]</div>
			</div>
		</div>
	)
}
