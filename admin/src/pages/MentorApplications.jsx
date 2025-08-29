import { useEffect, useState } from 'react'
import { AdminAPI } from '../utils/axiosInstance'

function DecisionModal({ open, onClose, onApprove, onReject, loading }) {
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md mt-16 bg-white rounded-2xl shadow-xl border">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-sm">Decide Application</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">✕</button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Set Mentor Password (required to approve)</label>
              <input className="mt-1 w-full px-3 py-2 rounded-lg border text-sm" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 8 characters" />
              <p className="text-[10px] text-gray-500 mt-1">The user will use this to log in as a mentor (overwrites their previous password).</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Rejection Notes (optional)</label>
              <textarea className="mt-1 w-full px-3 py-2 rounded-lg border text-sm h-20" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Reason if rejecting" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <button disabled={loading} onClick={()=>{ if(!notes.trim()) { if(!window.confirm('No notes provided. Reject anyway?')) return } onReject(notes) }} className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm disabled:opacity-50">Reject</button>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg border bg-white text-sm">Cancel</button>
                <button disabled={loading || password.length<8} onClick={()=>onApprove(password)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50">Approve</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MentorApplications(){
  const [status, setStatus] = useState('pending')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [decideId, setDecideId] = useState(null)
  const pageSize = 20

  async function load(){
    setLoading(true); setError('')
    try {
      const { data } = await AdminAPI.mentorApplications({ status, page, limit: pageSize })
      setItems(data.items); setTotal(data.total)
    } catch(e){ setError(e.response?.data?.message || 'Failed to load applications') } finally { setLoading(false) }
  }
  useEffect(()=>{ load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page])

  async function approve(pw){
    if(!decideId) return
    try { await AdminAPI.approveMentorApplication(decideId, pw); setDecideId(null); load() } catch(e){ alert(e.response?.data?.message || 'Approve failed') }
  }
  async function reject(notes){
    if(!decideId) return
    try { await AdminAPI.rejectMentorApplication(decideId, notes); setDecideId(null); load() } catch(e){ alert(e.response?.data?.message || 'Reject failed') }
  }

  const pages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mentor Applications</h1>
          <p className="text-xs text-gray-500">Review and decide on mentor requests.</p>
        </div>
        <div className="flex gap-2">
          {['pending','approved','rejected'].map(s => (
            <button key={s} onClick={()=>{ setStatus(s); setPage(1) }} className={`px-3 py-1.5 rounded-lg text-sm border ${status===s? 'bg-sky-600 text-white border-sky-600':'bg-white hover:bg-gray-50'}`}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
          ))}
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && <div className="text-sm text-rose-600">{error}</div>}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Applicant</th>
              <th className="px-3 py-2 font-medium">Expertise</th>
              <th className="px-3 py-2 font-medium">Submitted</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a._id} className="border-t hover:bg-gray-50/60">
                <td className="px-3 py-2">
                  <div className="font-medium text-gray-900">{a.name}</div>
                  <div className="text-[11px] text-gray-500">{a.email}</div>
                </td>
                <td className="px-3 py-2 text-xs text-gray-600">{(a.expertise||[]).slice(0,4).join(', ')||'-'}</td>
                <td className="px-3 py-2 text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-xs"><span className={`px-2 py-0.5 rounded-full text-[11px] border ${a.status==='pending'?'bg-amber-50 text-amber-700 border-amber-200': a.status==='approved'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-rose-50 text-rose-700 border-rose-200'}`}>{a.status}</span></td>
                <td className="px-3 py-2">
                  <div className="flex justify-end">
                    {a.status==='pending' ? (
                      <button onClick={()=>setDecideId(a._id)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs">Decide</button>
                    ) : (
                      <button onClick={()=>setDecideId(a._id)} className="px-3 py-1.5 rounded-lg border bg-white text-xs">View</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && !loading && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">No applications.</td></tr>}
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

      <DecisionModal open={!!decideId} onClose={()=>setDecideId(null)} loading={false} onApprove={approve} onReject={reject} />
    </div>
  )
}
