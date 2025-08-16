import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const validate = () => {
    if (!form.email || !form.password) return 'Please fill in all fields.'
    const ok = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(form.email)
    if (!ok) return 'Please enter a valid email.'
    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (v) return setError(v)
    setError('')
    try {
      await login(form.email, form.password)
      nav('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed.')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Log in to SkillSync</h1>
        {error && <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">Log in</button>
        </form>
        <p className="text-sm text-gray-600 mt-4 text-center">Don't have an account? <Link to="/signup" className="text-sky-700 hover:underline">Create one</Link></p>
      </div>
    </div>
  )
}
