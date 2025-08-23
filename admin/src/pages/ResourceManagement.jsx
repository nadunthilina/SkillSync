import { useEffect, useState } from 'react'
import { AdminAPI } from '../utils/axiosInstance'

export default function ResourceManagement() {
	const [items, setItems] = useState([])
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const [q, setQ] = useState('')
	const [form, setForm] = useState({ title: '', url: '', type: 'course', provider: '', featured: false })
	const limit = 10

	const load = async (opts={}) => {
		const params = { page: opts.page || page, limit, q }
		const { data } = await AdminAPI.resources(params)
		setItems(data.items); setTotal(data.total); setPage(data.page)
	}
	useEffect(()=>{ load({ page: 1 }) }, [q])

	const create = async (e) => { e.preventDefault(); await AdminAPI.createResource(form); setForm({ title:'', url:'', type:'course', provider:'', featured:false }); load() }
	const update = async (id, data) => { await AdminAPI.updateResource(id, data); load() }
	const del = async (id) => { if (confirm('Delete this resource?')) { await AdminAPI.deleteResource(id); load() } }

	const pages = Math.ceil(total/limit)

	return (
		<div className="space-y-4">
			<form onSubmit={create} className="rounded-2xl border bg-white p-4 grid sm:grid-cols-2 gap-3">
				<input className="border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} required />
				<input className="border rounded px-3 py-2" placeholder="URL" type="url" value={form.url} onChange={(e)=>setForm({...form, url: e.target.value})} required />
				<input className="border rounded px-3 py-2" placeholder="Provider" value={form.provider} onChange={(e)=>setForm({...form, provider: e.target.value})} />
				<select className="border rounded px-3 py-2" value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})}>
					{['course','article','video','book','other'].map(t=> <option key={t} value={t}>{t}</option>)}
				</select>
				<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e)=>setForm({...form, featured: e.target.checked})} /> Featured</label>
				<div className="sm:col-span-2"><button className="px-4 py-2 rounded bg-sky-600 text-white">Create Resource</button></div>
			</form>

			<div className="flex items-center gap-2">
				<input className="px-3 py-2 border rounded-lg" placeholder="Search resources..." value={q} onChange={(e)=>setQ(e.target.value)} />
			</div>

			<div className="rounded-2xl border bg-white overflow-x-auto">
				<table className="min-w-[800px] w-full text-sm">
					<thead>
						<tr className="border-b bg-gray-50 text-gray-600">
							<th className="text-left p-3">Title</th>
							<th className="text-left p-3">Type</th>
							<th className="text-left p-3">Provider</th>
							<th className="text-left p-3">Featured</th>
							<th className="text-left p-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{items.map(r => (
							<tr key={r._id} className="border-b">
								<td className="p-3"><a href={r.url} target="_blank" className="text-sky-700 hover:underline" rel="noreferrer">{r.title}</a></td>
								<td className="p-3">{r.type}</td>
								<td className="p-3">{r.provider||'-'}</td>
								<td className="p-3">{r.featured ? 'Yes' : 'No'}</td>
								<td className="p-3 flex gap-2">
									<button className="px-2 py-1 text-xs border rounded" onClick={()=>update(r._id, { featured: !r.featured })}>{r.featured ? 'Unfeature':'Feature'}</button>
									<button className="px-2 py-1 text-xs border rounded text-rose-600" onClick={()=>del(r._id)}>Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex items-center gap-2">
				<button className="px-3 py-1.5 border rounded" disabled={page<=1} onClick={()=>load({ page: page-1 })}>Prev</button>
				<span className="text-sm">Page {page} of {Math.ceil(total/limit)||1}</span>
				<button className="px-3 py-1.5 border rounded" disabled={page>=Math.ceil(total/limit)} onClick={()=>load({ page: page+1 })}>Next</button>
			</div>
		</div>
	)
}
