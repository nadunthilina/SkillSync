import { useEffect, useState } from 'react'
import { AdminAPI } from '../utils/axiosInstance'

export default function JobManagement() {
	const [items, setItems] = useState([])
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const [q, setQ] = useState('')
	const [form, setForm] = useState({ title: '', company: '', location: '', type: 'full-time', featured: false })
	const limit = 10

	const load = async (opts={}) => {
		const params = { page: opts.page || page, limit, q }
		const { data } = await AdminAPI.jobs(params)
		setItems(data.items); setTotal(data.total); setPage(data.page)
	}
	useEffect(()=>{ load({ page: 1 }) }, [q])

	const create = async (e) => { e.preventDefault(); await AdminAPI.createJob(form); setForm({ title:'', company:'', location:'', type:'full-time', featured:false }); load() }
	const update = async (id, data) => { await AdminAPI.updateJob(id, data); load() }
	const del = async (id) => { if (confirm('Delete this job?')) { await AdminAPI.deleteJob(id); load() } }

	const pages = Math.ceil(total/limit)

	return (
		<div className="space-y-4">
			<form onSubmit={create} className="rounded-2xl border bg-white p-4 grid sm:grid-cols-2 gap-3">
				<input className="border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} required />
				<input className="border rounded px-3 py-2" placeholder="Company" value={form.company} onChange={(e)=>setForm({...form, company: e.target.value})} required />
				<input className="border rounded px-3 py-2" placeholder="Location" value={form.location} onChange={(e)=>setForm({...form, location: e.target.value})} />
				<select className="border rounded px-3 py-2" value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})}>
					{['full-time','part-time','contract','internship','remote'].map(t=> <option key={t} value={t}>{t}</option>)}
				</select>
				<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e)=>setForm({...form, featured: e.target.checked})} /> Featured</label>
				<div className="sm:col-span-2"><button className="px-4 py-2 rounded bg-sky-600 text-white">Create Job</button></div>
			</form>

			<div className="flex items-center gap-2">
				<input className="px-3 py-2 border rounded-lg" placeholder="Search jobs..." value={q} onChange={(e)=>setQ(e.target.value)} />
			</div>

			<div className="rounded-2xl border bg-white overflow-x-auto">
				<table className="min-w-[800px] w-full text-sm">
					<thead>
						<tr className="border-b bg-gray-50 text-gray-600">
							<th className="text-left p-3">Title</th>
							<th className="text-left p-3">Company</th>
							<th className="text-left p-3">Type</th>
							<th className="text-left p-3">Featured</th>
							<th className="text-left p-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{items.map(j => (
							<tr key={j._id} className="border-b">
								<td className="p-3">{j.title}</td>
								<td className="p-3">{j.company}</td>
								<td className="p-3">{j.type}</td>
								<td className="p-3">{j.featured ? 'Yes' : 'No'}</td>
								<td className="p-3 flex gap-2">
									<button className="px-2 py-1 text-xs border rounded" onClick={()=>update(j._id, { featured: !j.featured })}>{j.featured ? 'Unfeature':'Feature'}</button>
									<button className="px-2 py-1 text-xs border rounded text-rose-600" onClick={()=>del(j._id)}>Delete</button>
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
