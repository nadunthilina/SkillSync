import { useState } from 'react'

export default function Settings() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const onSubmit = (e) => { e.preventDefault(); alert('Save settings: not implemented in demo') }
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Admin Settings</h2>
      <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-4 grid sm:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
        <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="New Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
        <div className="sm:col-span-2"><button className="px-4 py-2 rounded bg-sky-600 text-white">Save</button></div>
      </form>
    </div>
  )
}
