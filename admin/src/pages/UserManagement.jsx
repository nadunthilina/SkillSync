import { useEffect, useState } from 'react'
import { AdminAPI } from '../utils/axiosInstance'

export default function UserManagement() {
	const [items, setItems] = useState([])
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const [q, setQ] = useState('')
	const limit = 10

	const load = async (opts={}) => {
		const params = { page: opts.page || page, limit, q }
		const { data } = await AdminAPI.users(params)
		setItems(data.items); setTotal(data.total); setPage(data.page)
	}
	useEffect(()=>{ load({ page: 1 }) }, [q])

	const changeRole = async (id, role) => { await AdminAPI.changeRole(id, role); load() }
	const suspend = async (id, s) => { await AdminAPI.suspendUser(id, s); load() }
	const del = async (id) => { if (confirm('Delete this user?')) { await AdminAPI.deleteUser(id); load() } }

	const pages = Math.ceil(total/limit)

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<input className="px-3 py-2 border rounded-lg" placeholder="Search users..." value={q} onChange={(e)=>setQ(e.target.value)} />
			</div>
			<div className="rounded-2xl border bg-white overflow-x-auto">
				<table className="min-w-[700px] w-full text-sm">
					<thead>
						<tr className="border-b bg-gray-50 text-gray-600">
							<th className="text-left p-3">Name</th>
							<th className="text-left p-3">Email</th>
							<th className="text-left p-3">Role</th>
							<th className="text-left p-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{items.map(u => (
							<tr key={u._id} className="border-b">
								<td className="p-3">{u.name}</td>
								<td className="p-3">{u.email}</td>
								<td className="p-3">{u.role}</td>
								<td className="p-3 flex gap-2">
									<button className="px-2 py-1 text-xs border rounded" onClick={()=>changeRole(u._id, u.role==='admin' ? 'user':'admin')}>{u.role==='admin'?'Make User':'Make Admin'}</button>
									<button className="px-2 py-1 text-xs border rounded" onClick={()=>suspend(u._id, !u.suspended)}>{u.suspended?'Unsuspend':'Suspend'}</button>
									<button className="px-2 py-1 text-xs border rounded text-rose-600" onClick={()=>del(u._id)}>Delete</button>
								</td>
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
