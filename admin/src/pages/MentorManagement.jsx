import { useEffect, useState } from 'react'
import { AdminAPI } from '../utils/axiosInstance'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg mt-10 bg-white rounded-2xl shadow-xl border">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-sm">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">✕</button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function MentorManagement() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(null) // profile object
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', refNo:'', bio:'', expertise:'', yearsExperience:0, hourlyRate:'', availability:'' })
  const pageSize = 10

  async function load() {
    setLoading(true); setError('')
    try {
  const { data } = await AdminAPI.mentors({ page, limit: pageSize, q })
      setItems(data.items)
      setTotal(data.total)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load mentors')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  function resetForm(){ setForm({ name:'', email:'', password:'', phone:'', refNo:'', bio:'', expertise:'', yearsExperience:0, hourlyRate:'', availability:'' }) }

  async function createMentor(e){
    e.preventDefault(); setCreating(true)
    try {
      const payload = {
        ...form,
        expertise: form.expertise.split(',').map(s=>s.trim()).filter(Boolean),
        availability: form.availability.split(',').map(s=>{ const [day,range] = s.split(':'); if(!range) return null; const [from,to]=range.split('-'); return { day:day?.trim(), from:from?.trim(), to:to?.trim() } }).filter(Boolean)
      }
      await AdminAPI.createMentor(payload)
      resetForm(); setShowCreate(false)
      load()
    } catch (e) { alert(e.response?.data?.message || 'Failed') } finally { setCreating(false) }
  }

  async function approve(userId, approved){ await AdminAPI.approveMentor(userId, approved); load() }

  async function saveEdit(e){
    e.preventDefault()
    if (!showEdit) return
    try {
      const expertise = showEdit.expertise?.join(',') || ''
      const payload = {
        bio: showEdit.bio || '',
        expertise: (showEdit.expertise||[]),
        yearsExperience: Number(showEdit.yearsExperience)||0,
        hourlyRate: showEdit.hourlyRate? Number(showEdit.hourlyRate):undefined,
        availability: showEdit.availability||[],
        phone: showEdit.phone,
        refNo: showEdit.refNo,
      }
      await AdminAPI.updateMentor(showEdit.userId._id, payload)
      setShowEdit(null)
      load()
    } catch(e){ alert(e.response?.data?.message || 'Update failed') }
  }

  async function removeMentor(userId){ if (!window.confirm('Downgrade & remove mentor profile?')) return; await AdminAPI.deleteMentor(userId); load() }

  const pages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mentors</h1>
          <p className="text-xs text-gray-500">Create and manage platform mentors.</p>
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search mentors" className="px-3 py-1.5 text-sm rounded-lg border bg-white w-56" />
          <button type="button" onClick={()=>{ setPage(1); load() }} className="px-4 py-1.5 text-sm rounded-lg bg-sky-600 text-white shadow-sm">Search</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{total} mentors</div>
        <button onClick={()=>{ resetForm(); setShowCreate(true) }} className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm">Add Mentor</button>
      </div>

      {/* Mentors Table */}
      {loading && <div className="text-sm text-gray-500">Loading mentors…</div>}
      {error && <div className="text-sm text-rose-600 font-medium">{error}</div>}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Mentor</th>
              <th className="px-3 py-2 font-medium">Contact</th>
              <th className="px-3 py-2 font-medium">Expertise</th>
              <th className="px-3 py-2 font-medium">Hourly</th>
              <th className="px-3 py-2 font-medium">Ref</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => {
              const expertise = (p.expertise||[]).slice(0,3).join(', ') + ((p.expertise||[]).length>3?'…':'')
              return (
                <tr key={p._id} className="border-t hover:bg-gray-50/60">
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{p.userId?.name||'-'}</div>
                    <div className="text-[11px] text-gray-500">{p.yearsExperience||0} yrs exp</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-gray-700">{p.userId?.email}</div>
                    <div className="text-[11px] text-gray-500">{p.phone||'-'}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">{expertise||'-'}</td>
                  <td className="px-3 py-2 text-xs">{p.hourlyRate? '$'+p.hourlyRate : '-'}</td>
                  <td className="px-3 py-2 text-xs">{p.refNo||'-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={()=>setShowEdit(p)} className="px-2 py-1 rounded-md bg-white border text-xs hover:bg-sky-50">Edit</button>
                      <button onClick={()=>removeMentor(p.userId._id)} className="px-2 py-1 rounded-md bg-rose-600 text-white text-xs">Remove</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!items.length && !loading && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">No mentors found.</td></tr>}
          </tbody>
        </table>
      </div>

      {pages>1 && (
        <div className="flex gap-2 items-center">
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 rounded border disabled:opacity-50">Prev</button>
          <span className="text-sm">Page {page} / {pages}</span>
          <button disabled={page===pages} onClick={()=>setPage(p=>p+1)} className="px-2 py-1 rounded border disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Create Mentor Modal */}
      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Add Mentor">
        <form onSubmit={createMentor} className="space-y-3 text-sm relative">
          {creating && <div className="absolute inset-0 bg-white/70 rounded-lg grid place-items-center text-xs text-sky-700">Saving…</div>}
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="px-3 py-2 rounded-lg border" />
            <input required placeholder="Email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="px-3 py-2 rounded-lg border" />
            <input required placeholder="Password" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} className="px-3 py-2 rounded-lg border" />
            <input required placeholder="Phone" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="px-3 py-2 rounded-lg border" />
            <input required placeholder="Ref No" value={form.refNo} onChange={e=>setForm(f=>({...f,refNo:e.target.value}))} className="px-3 py-2 rounded-lg border" />
            <input placeholder="Hourly Rate" type="number" value={form.hourlyRate} onChange={e=>setForm(f=>({...f,hourlyRate:e.target.value}))} className="px-3 py-2 rounded-lg border" />
            <input placeholder="Expertise (csv)" value={form.expertise} onChange={e=>setForm(f=>({...f,expertise:e.target.value}))} className="px-3 py-2 rounded-lg border col-span-2" />
            <input placeholder="Availability Mon:09-11,Tue:13-15" value={form.availability} onChange={e=>setForm(f=>({...f,availability:e.target.value}))} className="px-3 py-2 rounded-lg border col-span-2" />
            <textarea placeholder="Short bio" value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} className="px-3 py-2 rounded-lg border col-span-2 h-28" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={()=>setShowCreate(false)} className="px-4 py-2 rounded-lg border text-gray-700 bg-white">Cancel</button>
            <button disabled={creating} className="px-4 py-2 rounded-lg bg-sky-600 text-white">{creating?'Saving…':'Create Mentor'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Mentor Modal */}
      <Modal open={!!showEdit} onClose={()=>setShowEdit(null)} title="Edit Mentor Profile">
        {showEdit && (
          <form onSubmit={saveEdit} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">Name</label>
                <div className="px-3 py-2 rounded-lg border bg-gray-50 text-gray-600 text-sm">{showEdit.userId?.name}</div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">Email</label>
                <div className="px-3 py-2 rounded-lg border bg-gray-50 text-gray-600 text-sm">{showEdit.userId?.email}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Phone</label>
                <input value={showEdit.phone||''} onChange={e=>setShowEdit(m=>({...m,phone:e.target.value}))} className="mt-1 px-3 py-2 rounded-lg border w-full" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Ref No</label>
                <input value={showEdit.refNo||''} onChange={e=>setShowEdit(m=>({...m,refNo:e.target.value}))} className="mt-1 px-3 py-2 rounded-lg border w-full" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Years Experience</label>
                <input type="number" value={showEdit.yearsExperience||0} onChange={e=>setShowEdit(m=>({...m,yearsExperience:e.target.value}))} className="mt-1 px-3 py-2 rounded-lg border w-full" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Hourly Rate</label>
                <input type="number" value={showEdit.hourlyRate||''} onChange={e=>setShowEdit(m=>({...m,hourlyRate:e.target.value}))} className="mt-1 px-3 py-2 rounded-lg border w-full" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">Expertise (csv)</label>
                <input value={(showEdit.expertise||[]).join(', ')} onChange={e=>setShowEdit(m=>({...m,expertise:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} className="mt-1 px-3 py-2 rounded-lg border w-full" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">Bio</label>
                <textarea value={showEdit.bio||''} onChange={e=>setShowEdit(m=>({...m,bio:e.target.value}))} className="mt-1 px-3 py-2 rounded-lg border w-full h-28" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={()=>approve(showEdit.userId._id, !showEdit.approved)} className={`px-3 py-2 rounded-lg text-xs font-medium ${showEdit.approved? 'bg-amber-600 text-white':'bg-emerald-600 text-white'}`}>{showEdit.approved? 'Unapprove':'Approve'}</button>
              <div className="flex gap-2">
                <button type="button" onClick={()=>setShowEdit(null)} className="px-4 py-2 rounded-lg border bg-white">Cancel</button>
                <button className="px-4 py-2 rounded-lg bg-sky-600 text-white">Save Changes</button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
