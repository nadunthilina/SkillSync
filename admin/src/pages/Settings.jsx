import { useEffect, useState } from 'react'
import { api, AdminAPI } from '../utils/axiosInstance'

export default function Settings() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // load current admin profile
  useEffect(()=>{ (async()=>{
    try { const { data } = await api.get('/auth/me'); if (data.user) setForm(f=>({ ...f, name: data.user.name||'', email: data.user.email||'' })) } catch {}
  })() }, [])

  const onSubmit = async (e) => { 
    e.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const payload = {}
      if (form.name) payload.name = form.name
      if (form.email) payload.email = form.email
      if (form.password) payload.password = form.password
      const { data } = await AdminAPI.updateSettings(payload)
      setMessage('Saved')
      setForm(f=>({ ...f, password: '' }))
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Admin Settings</h2>
      <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-5 space-y-4 max-w-3xl">
        {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">{error}</div>}
        {message && <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">{message}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Name</label>
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Email</label>
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-medium text-gray-500">New Password (leave blank to keep current)</label>
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="New Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button disabled={saving} className="px-5 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium disabled:opacity-60">{saving? 'Saving…':'Save'}</button>
          <span className="text-xs text-gray-500">Password must be at least 8 characters.</span>
        </div>
      </form>
    </div>
  )
}
