import { useState } from 'react'
import axios from 'axios'

export default function AdminRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/register-with-role', form, { withCredentials: true })
      if (data.user?.role !== form.role && form.role === 'admin') {
        setError('Could not create admin (one already exists). Use an existing admin to add more.')
        return
      }
      window.location.href = '/admin'
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Create Admin / Mentor</h1>
          <p className="text-xs text-gray-500 mt-1">Bootstrap the first admin or register a mentor.</p>
        </div>
        {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">{error}</div>}
        <form className="space-y-4" onSubmit={submit}>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Full name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Password" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required />
          <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
            <option value="admin">Admin (only if none exists)</option>
            <option value="mentor">Mentor</option>
            <option value="user">Standard User</option>
          </select>
          <button disabled={loading} className="w-full px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium disabled:opacity-60">{loading?'Creating…':'Sign up'}</button>
        </form>
        <div className="text-[11px] text-gray-500 leading-relaxed">
          <p>If an admin already exists you must ask them to promote accounts instead of creating new admins here.</p>
        </div>
        <div className="text-center text-xs text-gray-500">
          <a href="/admin/login" className="text-sky-600 hover:underline">Back to login</a>
        </div>
      </div>
    </div>
  )
}
