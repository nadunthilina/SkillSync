import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthAPI } from '../lib/api'

export default function ResetPassword() {
  const nav = useNavigate()
  const { token } = useParams()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.password) e.password = 'Password is required.'
    if (!form.confirm) e.confirm = 'Confirm your password.'
    if (form.password && form.confirm && form.password !== form.confirm) e.confirm = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    setError('')
    if (!validate()) return
    try {
      await AuthAPI.resetPassword(token, form.password)
      nav('/login', { state: { resetSuccess: true } })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        {error && <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-gray-600">New Password</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
            {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" type="password" value={form.confirm} onChange={(e)=>setForm({...form, confirm: e.target.value})} />
            {errors.confirm && <p className="text-xs text-rose-600 mt-1">{errors.confirm}</p>}
          </div>
          <button type="submit" className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">Reset Password</button>
        </form>
        <p className="text-sm text-gray-600 mt-4 text-center"><Link to="/login" className="text-sky-700 hover:underline">Back to login</Link></p>
      </div>
    </div>
  )
}
