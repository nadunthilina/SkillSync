import { useEffect, useState } from 'react'
import { AdminAPI } from '../utils/axiosInstance'

export default function Logs() {
	const [items, setItems] = useState([])
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const limit = 20
	const load = async (opts={}) => {
		const { data } = await AdminAPI.logs({ page: opts.page || page, limit })
		setItems(data.items); setTotal(data.total); setPage(data.page)
	}
	useEffect(()=>{ load({ page: 1 }) }, [])
	const pages = Math.ceil(total/limit)
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold">Activity Logs</h2>
				<a href="/api/admin/reports/users.csv" className="px-3 py-1.5 rounded bg-sky-600 text-white">Export Users CSV</a>
			</div>
			<div className="rounded-2xl border bg-white overflow-x-auto">
				<table className="min-w-[700px] w-full text-sm">
					<thead>
						<tr className="border-b bg-gray-50 text-gray-600">
							<th className="text-left p-3">Type</th>
							<th className="text-left p-3">Message</th>
							<th className="text-left p-3">Time</th>
						</tr>
					</thead>
					<tbody>
						{items.map(l => (
							<tr key={l._id} className="border-b">
								<td className="p-3">{l.type}</td>
								<td className="p-3">{l.message||'-'}</td>
								<td className="p-3">{new Date(l.createdAt).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex items-center gap-2">
				<button className="px-3 py-1.5 border rounded" disabled={page<=1} onClick={()=>load({ page: page-1 })}>Prev</button>
				<span className="text-sm">Page {page} of {pages||1}</span>
				<button className="px-3 py-1.5 border rounded" disabled={page>=pages} onClick={()=>load({ page: page+1 })}>Next</button>
			</div>
		</div>
	)
}
