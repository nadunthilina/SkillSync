import { useState } from 'react'
import axios from 'axios'

export default function AdminLogin() {
	const [form, setForm] = useState({ email: '', password: '' })
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const submit = async (e) => {
		e.preventDefault(); setError(''); setLoading(true)
		try {
			const { data } = await axios.post('/api/auth/login', form, { withCredentials: true })
			if (data.user?.role !== 'admin') {
				setError('This account is not an admin. Promote it first.')
				return
			}
			window.location.href = '/admin'
		} catch (err) {
			setError(err?.response?.data?.message || 'Login failed')
		} finally { setLoading(false) }
	}
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 p-4">
			<div className="w-full max-w-md bg-white border rounded-2xl p-8 shadow-sm space-y-6">
				<div>
					<h1 className="text-2xl font-semibold">Admin Portal</h1>
					<p className="text-xs text-gray-500 mt-1">Restricted area. Authorized admins only.</p>
				</div>
				{error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">{error}</div>}
				<form className="space-y-4" onSubmit={submit}>
					<input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Admin email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required />
					<input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Password" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required />
					<button disabled={loading} className="w-full px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium disabled:opacity-60">{loading?'Logging in…':'Log in'}</button>
				</form>
				<div className="text-[11px] text-gray-500 leading-relaxed">
					<p>First time? If no admin exists either:</p>
					<ul className="list-disc pl-4 mt-1 space-y-0.5">
						<li>Set env vars ADMIN_EMAIL & ADMIN_PASSWORD then restart server, or</li>
						<li>POST /api/auth/bootstrap-admin (dev only) to create the first admin.</li>
					</ul>
					<p className="mt-2">Or <a href="/admin/register" className="text-sky-600 hover:underline">sign up with a role</a>.</p>
				</div>
			</div>
		</div>
	)
}
