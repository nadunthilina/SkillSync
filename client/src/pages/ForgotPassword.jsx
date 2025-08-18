import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthAPI } from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [error, setError] = useState('')

  const validate = () => {
    const e = {}
    if (!email) e.email = 'Email is required.'
    else if (!/[^@\s]+@[^@\s]+\.[^@\s]+/.test(email)) e.email = 'Enter a valid email.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    setAlert(''); setError('')
    if (!validate()) return
    try {
      await AuthAPI.forgotPassword(email)
      setAlert('Reset link sent to your email')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset link')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
        {error && <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}
        {alert && <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">{alert}</div>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
          </div>
          <button type="submit" className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">Send reset link</button>
        </form>
        <p className="text-sm text-gray-600 mt-4 text-center"><Link to="/login" className="text-sky-700 hover:underline">Back to login</Link></p>
      </div>
    </div>
  )
}
