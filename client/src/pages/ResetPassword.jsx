import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthAPI } from '../lib/api'

export default function ResetPassword() {
  const nav = useNavigate()
  const { token } = useParams()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hp, setHp] = useState('') // honeypot
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const strength = useMemo(() => {
    const pw = form.password || ''
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    // cap score at 4 for display (0-4)
    return Math.min(score, 4)
  }, [form.password])

  const validate = () => {
    const e = {}
    const pw = form.password || ''
    if (!pw) e.password = 'Password is required.'
    // Strong policy: min 8, upper, lower, digit, special
    if (pw && pw.length < 8) e.password = 'At least 8 characters.'
    if (pw && !/[a-z]/.test(pw)) e.password = 'Include a lowercase letter.'
    if (pw && !/[A-Z]/.test(pw)) e.password = 'Include an uppercase letter.'
    if (pw && !/\d/.test(pw)) e.password = 'Include a number.'
    if (pw && !/[^A-Za-z0-9]/.test(pw)) e.password = 'Include a special character.'
    if (!form.confirm) e.confirm = 'Confirm your password.'
    if (form.password && form.confirm && form.password !== form.confirm) e.confirm = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    setError('')
    if (!validate()) return
    if (hp) return // honeypot triggered, silently drop
    setLoading(true)
    try {
      const start = Date.now()
      await AuthAPI.resetPassword(token, form.password)
      const elapsed = Date.now() - start
      if (elapsed < 400) await new Promise(r => setTimeout(r, 400 - elapsed))
      nav('/login', { state: { resetSuccess: true } })
    } catch (err) {
      // Generic error to avoid leaking reset token validity details
      setError('Failed to reset password. Please request a new link and try again.')
    }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        {error && <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-gray-600">New Password</label>
            <div className="relative">
              <input className="mt-1 w-full border rounded-lg px-3 py-2 pr-10" autoComplete="new-password" type={showPw ? 'text' : 'password'} value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
              <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{showPw ? 'Hide' : 'Show'}</button>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <p className="mb-1">Use at least 8 characters including upper/lowercase, a number, and a special character.</p>
              <div className="h-1.5 rounded bg-gray-100 overflow-hidden">
                <div className={`h-full transition-all ${strength <= 1 ? 'bg-rose-500 w-1/4' : strength === 2 ? 'bg-amber-500 w-2/4' : strength === 3 ? 'bg-emerald-500 w-3/4' : 'bg-emerald-600 w-full'}`}></div>
              </div>
            </div>
            {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <div className="relative">
              <input className="mt-1 w-full border rounded-lg px-3 py-2 pr-10" autoComplete="new-password" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={(e)=>setForm({...form, confirm: e.target.value})} />
              <button type="button" onClick={()=>setShowConfirm(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{showConfirm ? 'Hide' : 'Show'}</button>
            </div>
            {errors.confirm && <p className="text-xs text-rose-600 mt-1">{errors.confirm}</p>}
          </div>
          {/* Honeypot hidden field */}
          <input className="hidden" tabIndex={-1} autoComplete="off" value={hp} onChange={(e)=>setHp(e.target.value)} aria-hidden="true" />
          <button type="submit" disabled={loading} className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60">{loading ? 'Resetting…' : 'Reset Password'}</button>
        </form>
        <p className="text-sm text-gray-600 mt-4 text-center"><Link to="/login" className="text-sky-700 hover:underline">Back to login</Link></p>
      </div>
    </div>
  )
}
