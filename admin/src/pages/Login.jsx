import { useState } from 'react'
import axios from 'axios'

export default function AdminLogin() {
	const [form, setForm] = useState({ email: '', password: '' })
	const [error, setError] = useState('')
	const onSubmit = async (e) => {
		e.preventDefault(); setError('')
		try {
			await axios.post('/api/auth/login', form, { withCredentials: true })
			window.location.href = '/admin'
		} catch (err) {
			setError(err?.response?.data?.message || 'Login failed')
		}
	}
	return (
		<div className="min-h-screen grid place-items-center p-6 bg-gray-50">
			<div className="w-full max-w-md bg-white border rounded-2xl p-6">
				<h1 className="text-xl font-semibold mb-4">Admin Login</h1>
				{error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
				<form className="space-y-3" onSubmit={onSubmit}>
					<input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
					<input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
					<button className="w-full px-4 py-2 rounded bg-sky-600 text-white">Log in</button>
				</form>
			</div>
		</div>
	)
}
