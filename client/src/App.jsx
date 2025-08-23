import { useEffect, useState } from 'react'
import { Routes, Route, Link, NavLink, Outlet } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'
import axios from 'axios'
import { Brain, LineChart, Users2, MessageSquareText, User, LogOut, Search, Menu } from 'lucide-react'
import { useAuth } from './context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const brand = {
  name: 'SkillSync',
  gradient: 'bg-gradient-to-r from-sky-500 via-teal-500 to-blue-600',
}

function HealthDot() {
  const [status, setStatus] = useState('loading') // loading | ok | fail
  useEffect(() => {
    axios.get('/api/health').then(() => setStatus('ok')).catch(() => setStatus('fail'))
  }, [])
  const color = status === 'ok' ? 'bg-emerald-500' : status === 'fail' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'
  return <span title={`API: ${status}`} className={`inline-block h-2.5 w-2.5 rounded-full ${color}`}></span>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [forgotForm, setForgotForm] = useState({ email: '' })
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [hp, setHp] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setAuthLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to log in')
    } finally {
      setAuthLoading(false)
    }
  }

  const validatePassword = (pw) => /[A-Za-z]/.test(pw) && /\d/.test(pw) && pw.length >= 8

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setAuthLoading(true)
    try {
      if (hp) throw new Error('Bot detected')
      const now = Date.now()
      if (now < cooldownUntil) throw new Error('Please wait a moment before trying again')
      const name = signupForm.name.trim()
      const email = signupForm.email.trim().toLowerCase()
      const pw = signupForm.password
      const confirm = signupForm.confirm
      if (!name || !email || !pw) throw new Error('All fields are required')
      if (pw !== confirm) throw new Error('Passwords do not match')
      if (!validatePassword(pw)) throw new Error('Password must be at least 8 characters and include letters and numbers')
      const start = Date.now()
      await signup(name, email, pw)
      const elapsed = Date.now() - start
      if (elapsed < 400) await new Promise(r => setTimeout(r, 400 - elapsed))
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to sign up')
      setCooldownUntil(Date.now() + 3000)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError('')
    setForgotLoading(true)
    try {
      if (hp) throw new Error('Bot detected')
      const now = Date.now()
      if (now < cooldownUntil) throw new Error('Please wait a moment before trying again')
      const email = forgotForm.email.trim().toLowerCase()
      const { AuthAPI } = await import('./lib/api')
      await AuthAPI.forgotPassword(email)
      setForgotSent(true)
    } catch (err) {
      // For security, show generic success; optionally show server message during dev
      setForgotSent(true)
      setCooldownUntil(Date.now() + 3000)
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div>
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className={`h-8 w-8 rounded-lg ${brand.gradient}`}></div>
            <span>SkillSync</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how" className="hover:text-gray-900">How it works</a>
            <a href="#mentors" className="hover:text-gray-900">Mentors</a>
          </nav>
          <div className="flex items-center gap-3">
            <HealthDot />
            <button onClick={()=>{ setShowLogin(true); setError('') }} className="px-3 py-1.5 text-sm rounded-lg border">Log in</button>
            <button onClick={()=>{ setShowSignup(true); setError('') }} className="px-3 py-1.5 text-sm rounded-lg text-white bg-sky-600 hover:bg-sky-700">Get Started</button>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-b from-white to-sky-50">
          <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 items-center gap-10">
            <div>
              <p className="text-sky-600 font-medium mb-2">AI-Powered Career Development</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Bridge Your Skills to Your Dream Job</h1>
              <p className="text-gray-600 mb-6">Identify your gaps, get a personalized learning roadmap, and connect with mentors — all in one place.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="px-5 py-3 rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-sm">Get Started</Link>
                <a href="#features" className="px-5 py-3 rounded-lg border hover:bg-white">Learn More</a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-teal-400/30 to-blue-500/30 blur-2xl rounded-3xl"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-xl ${brand.gradient}`}></div>
                  <div>
                    <p className="font-semibold">AI + Career Growth</p>
                    <p className="text-xs text-gray-500">Smart insights from real job data</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                  <div className="p-3 rounded-lg bg-sky-50 border"><p className="font-medium">Skills</p><p>Analyze strengths</p></div>
                  <div className="p-3 rounded-lg bg-teal-50 border"><p className="font-medium">Gaps</p><p>Find what’s missing</p></div>
                  <div className="p-3 rounded-lg bg-blue-50 border"><p className="font-medium">Roadmap</p><p>Learn step-by-step</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={<Brain className="h-6 w-6 text-sky-600" />} title="Skill Gap Analysis" desc="Compare your skills with real job requirements using NLP." />
            <FeatureCard icon={<LineChart className="h-6 w-6 text-teal-600" />} title="Personalized Roadmap" desc="Get curated courses, projects, and a timeline that fits you." />
            <FeatureCard icon={<Users2 className="h-6 w-6 text-blue-600" />} title="Mentor Matching" desc="Connect with mentors who guide your journey in real time." />
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-sm text-gray-500 text-center">© {new Date().getFullYear()} SkillSync</footer>

      {/* Auth Modals */}
      <Modal open={showLogin} onClose={()=>setShowLogin(false)} title="Log in">
        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        <form className="space-y-3" onSubmit={handleLogin}>
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" type="email" value={loginForm.email} onChange={(e)=>setLoginForm({...loginForm, email: e.target.value})} required />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Password" type="password" value={loginForm.password} onChange={(e)=>setLoginForm({...loginForm, password: e.target.value})} required />
          <button type="submit" disabled={authLoading} className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60">{authLoading ? 'Logging in…' : 'Log in'}</button>
        </form>
        <div className="mt-3 text-xs text-gray-500">Forgot password? <button className="text-sky-600 hover:underline" onClick={()=>{ setShowLogin(false); setShowForgot(true); setError(''); setForgotSent(false); setForgotForm({ email: '' }) }}>Reset</button></div>
        <div className="mt-3 text-xs text-gray-500">No account? <button className="text-sky-600 hover:underline" onClick={()=>{ setShowLogin(false); setShowSignup(true); }}>Sign up</button></div>
      </Modal>

      <Modal open={showSignup} onClose={()=>setShowSignup(false)} title="Create your account">
        {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
        <form className="space-y-3" onSubmit={handleSignup}>
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Name" value={signupForm.name} onChange={(e)=>setSignupForm({...signupForm, name: e.target.value})} required />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" type="email" value={signupForm.email} onChange={(e)=>setSignupForm({...signupForm, email: e.target.value})} required />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Password (min 8 chars, letters & numbers)" type="password" value={signupForm.password} onChange={(e)=>setSignupForm({...signupForm, password: e.target.value})} required />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Confirm password" type="password" value={signupForm.confirm} onChange={(e)=>setSignupForm({...signupForm, confirm: e.target.value})} required />
          <input className="hidden" tabIndex={-1} autoComplete="off" value={hp} onChange={(e)=>setHp(e.target.value)} aria-hidden="true" />
          <button type="submit" disabled={authLoading} className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60">{authLoading ? 'Creating…' : 'Sign up'}</button>
        </form>
        <div className="mt-3 text-xs text-gray-500">Already have an account? <button className="text-sky-600 hover:underline" onClick={()=>{ setShowSignup(false); setShowLogin(true); }}>Log in</button></div>
      </Modal>

      <Modal open={showForgot} onClose={()=>setShowForgot(false)} title="Reset your password">
        {forgotSent ? (
          <div className="space-y-3 text-sm">
            <p>We’ve sent a password reset link to your email if an account exists.</p>
            <button className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700" onClick={()=>{ setShowForgot(false); setShowLogin(true) }}>Back to login</button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleForgot}>
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Your email" type="email" value={forgotForm.email} onChange={(e)=>setForgotForm({ email: e.target.value })} required />
            <input className="hidden" tabIndex={-1} autoComplete="off" value={hp} onChange={(e)=>setHp(e.target.value)} aria-hidden="true" />
            <button type="submit" disabled={forgotLoading || Date.now() < cooldownUntil} className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60">{forgotLoading ? 'Sending…' : (Date.now() < cooldownUntil ? 'Please wait…' : 'Send reset link')}</button>
          </form>
        )}
      </Modal>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  )
}

function AuthPage({ mode }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const url = mode === 'login' ? 'http://localhost:4000/api/auth/login' : 'http://localhost:4000/api/auth/register'
      const payload = mode === 'login' ? { email: form.email, password: form.password } : { name: form.name, email: form.email, password: form.password }
      await axios.post(url, payload, { withCredentials: true })
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong')
    }
  }
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block bg-gradient-to-br from-sky-50 to-teal-50 p-10">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-3">Your learning journey starts here</h2>
          <p className="text-gray-600">Join SkillSync to get a tailored plan and mentorship to reach your dream role.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
  <div className="w-full max-w-md bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className={`h-8 w-8 rounded-lg ${brand.gradient}`}></div>
            <p className="font-semibold">SkillSync</p>
          </div>
          <h1 className="text-2xl font-bold mb-6">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === 'register' && (
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
            )}
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
            <button type="submit" className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
          </form>
          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-2 text-center">Or continue with</p>
            <div className="flex gap-3 justify-center">
              <div className="h-9 w-9 rounded-full border grid place-items-center">G</div>
              <div className="h-9 w-9 rounded-full border grid place-items-center">in</div>
              <div className="h-9 w-9 rounded-full border grid place-items-center">GH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppShell() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LineChart className="h-5 w-5" /> },
    { to: '/analyzer', label: 'Skill Analyzer', icon: <Brain className="h-5 w-5" /> },
    { to: '/roadmap', label: 'Roadmap', icon: <LineChart className="h-5 w-5" /> },
    { to: '/mentors', label: 'Mentors', icon: <Users2 className="h-5 w-5" /> },
    { to: '/chat', label: 'Chat', icon: <MessageSquareText className="h-5 w-5" /> },
    { to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ]
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className={`border-r bg-white ${open ? 'block' : 'hidden'} md:block`}>
        <div className="h-14 border-b px-4 flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg ${brand.gradient}`}></div>
          <span className="font-semibold">SkillSync</span>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-sky-50 text-sky-700' : 'hover:bg-gray-50'}`}>
              {n.icon}
              <span className="text-sm">{n.label}</span>
            </NavLink>
          ))}
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 w-full text-left" onClick={async()=>{ await logout(); }}><LogOut className="h-5 w-5" /><span className="text-sm">Logout</span></button>
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="h-14 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 rounded-lg border" onClick={() => setOpen(!open)}><Menu className="h-5 w-5" /></button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border">
              <Search className="h-4 w-4 text-gray-500" />
              <input className="bg-transparent outline-none text-sm" placeholder="Search courses, skills..." />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HealthDot />
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600"></div>
          </div>
        </header>
  <main className="p-4 bg-gray-50 flex-1"><Outlet /></main>
      </div>
    </div>
  )
}

function DashboardPage() {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ (async()=>{ try { const { data } = await axios.get('/api/user/progress', { withCredentials:true }); setProgress(data.progress) } catch(e){ console.error(e) } finally { setLoading(false) } })() }, [])
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold mb-3">Progress Overview</h2>
          <ProgressCharts progress={progress} loading={loading} />
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold mb-3">Missing Skills</h2>
          <div className="flex flex-wrap gap-2">
            {['System Design','GraphQL','AWS','Kubernetes'].map(s => <span key={s} className="px-3 py-1.5 text-sm rounded-full bg-sky-50 text-sky-700 border">{s}</span>)}
          </div>
          <button className="mt-4 px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">Start Analysis</button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5"><h2 className="font-semibold mb-3">Quick Links</h2><ul className="list-disc pl-5 text-sm text-gray-600 space-y-1"><li>Run Skill Analyzer</li><li>View Roadmap</li><li>Find a Mentor</li></ul></div>
        <div className="rounded-2xl border bg-white p-5"><h2 className="font-semibold mb-3">Upcoming</h2><p className="text-sm text-gray-600">Your next tasks appear here.</p></div>
      </div>
    </div>
  )
}

// Charts component (client dashboard)
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar } from 'recharts'

function ProgressCharts({ progress, loading }) {
  if (loading) return <div className="h-40 grid place-items-center text-gray-400 text-sm">Loading…</div>
  if (!progress) return <div className="h-40 grid place-items-center text-gray-400 text-sm">No data yet</div>
  const radialData = [{ name:'Completion', value: progress.completionPercent }]
  const COLORS = ['#0ea5e9','#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6']
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="h-40 rounded-xl border bg-white/50 flex flex-col">
        <p className="text-xs font-medium px-3 pt-2 text-gray-500">Overall</p>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius={40} outerRadius={70} data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar minAngle={15} clockWise background dataKey="value" fill="#0ea5e9" cornerRadius={10} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-sky-600 font-semibold text-sm">{progress.completionPercent}%</text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="h-40 rounded-xl border bg-white/50 flex flex-col">
        <p className="text-xs font-medium px-3 pt-2 text-gray-500">Weekly Hours</p>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progress.weeks} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <XAxis dataKey="weekStart" tickFormatter={d=>d.slice(5)} fontSize={10} stroke="#94a3b8" />
              <YAxis width={24} fontSize={10} stroke="#94a3b8" />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="hours" radius={[4,4,0,0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="h-40 rounded-xl border bg-white/50 flex flex-col">
        <p className="text-xs font-medium px-3 pt-2 text-gray-500">Skill Categories</p>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={progress.categories} dataKey="value" nameKey="name" innerRadius={25} outerRadius={55} paddingAngle={2}>
                {progress.categories.map((c,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function AnalyzerPage() {
  const [role, setRole] = useState('Frontend Developer')
  const [skills, setSkills] = useState('react, javascript, css')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const analyze = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/analyzer/analyze', { role, skillsText: skills }, { withCredentials: true })
      setResult(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 rounded-2xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Skill Analyzer</h2>
        <div className="space-y-3">
          <select className="w-full border rounded-lg px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Data Scientist</option>
          </select>
          <textarea className="w-full border rounded-lg px-3 py-2 h-28" placeholder="Your current skills (comma separated)" value={skills} onChange={e=>setSkills(e.target.value)}></textarea>
          <button type="button" disabled={loading} onClick={analyze} className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60">{loading? 'Analyzing…':'Analyze'}</button>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4">
        {result && (
          <>
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="font-semibold mb-2">Missing Skills</h3>
              {result.missingSkills.length === 0 ? <p className="text-sm text-gray-500">No gaps detected 🎉</p> : (
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map(s => <span key={s} className="px-3 py-1.5 text-sm rounded-full bg-emerald-50 text-emerald-700 border">{s}</span>)}
                </div>
              )}
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="font-semibold mb-3">Recommended Resources</h3>
              <div className="space-y-3">
                {result.recommendedResources.map(r => (
                  <div key={r.skill} className="rounded-xl border p-3">
                    <p className="font-medium mb-1">{r.skill}</p>
                    <ul className="text-xs text-gray-600 list-disc pl-4 space-y-0.5">
                      {r.resources.map(res => <li key={res}>{res}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function RoadmapPage() {
  const [missing, setMissing] = useState('react testing typescript')
  const [role, setRole] = useState('Frontend Developer')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const generate = async () => {
    setLoading(true)
    try {
      const missingSkills = missing.split(/[,\s]/).map(s=>s.trim().toLowerCase()).filter(Boolean)
      const { data } = await axios.post('/api/roadmap/generate', { role, missingSkills }, { withCredentials: true })
      setTasks(data.tasks)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Generate Roadmap</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <select className="border rounded-lg px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Data Scientist</option>
          </select>
          <input className="border rounded-lg px-3 py-2 sm:col-span-2" value={missing} onChange={e=>setMissing(e.target.value)} placeholder="Missing skills" />
          <button onClick={generate} disabled={loading} className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 sm:col-span-3">{loading? 'Generating…':'Generate'}</button>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Roadmap Tasks</h2>
        {tasks.length === 0 ? <p className="text-sm text-gray-500">No tasks yet.</p> : (
          <div className="divide-y">
            {tasks.map(t => (
              <div key={t.week} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="text-xs font-medium px-2 py-1 rounded-md bg-sky-100 text-sky-700 border">Week {t.week}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.description}</p>
                </div>
                <div className="text-xs text-gray-500">{t.estimatedHours}h</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ChatPage() {
  const [mentors, setMentors] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const loadMentors = async () => {
    try { const { data } = await axios.get('/api/chat/conversations', { withCredentials: true }); setMentors(data.mentors) } catch(e){ console.error(e) }
  }
  const loadMessages = async (mentorId) => {
    try { const { data } = await axios.get(`/api/chat/messages/${mentorId}`, { withCredentials: true }); setMessages(data.messages); setActive(mentorId) } catch(e){ console.error(e) }
  }
  const send = async () => {
    if (!active || !text.trim()) return
    const t = text
    setText('')
    try { const { data } = await axios.post(`/api/chat/messages/${active}`, { text: t }, { withCredentials: true }); setMessages(m => [...m, ...data.messages]) } catch(e){ console.error(e) }
  }
  useEffect(()=>{ loadMentors() }, [])
  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-4">
      <div className="rounded-2xl border bg-white p-3 space-y-2">
        {mentors.map(m => (
          <button key={m._id} onClick={()=>loadMessages(m._id)} className={`block w-full text-left p-3 rounded-lg border ${active===m._id?'bg-sky-50 border-sky-300':'hover:bg-gray-50'}`}>{m.name || 'Mentor'}</button>
        ))}
        {mentors.length===0 && <p className="text-xs text-gray-500">No mentors yet.</p>}
      </div>
      <div className="rounded-2xl border bg-white flex flex-col">
        <div className="border-b p-3 font-medium">{active? 'Conversation':'Select a mentor'}</div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {messages.map(m => (
            <div key={m._id} className={`max-w-sm rounded-2xl px-3 py-2 ${m.sender==='user'?'bg-sky-600 text-white ml-auto':'bg-gray-100'}`}>{m.text}</div>
          ))}
        </div>
        {active && (
          <div className="border-t p-3 flex gap-2">
            <input className="flex-1 border rounded-lg px-3 py-2" placeholder="Type a message..." value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send() }} />
            <button onClick={send} className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">Send</button>
          </div>
        )}
      </div>
    </div>
  )
}

function MentorsPage() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [choosing, setChoosing] = useState('')
  const choose = async (id) => {
    setChoosing(id)
    try { await axios.post('/api/user/choose-mentor', { mentorId: id }, { withCredentials: true }); alert('Mentor selected'); } catch(e){ alert(e.response?.data?.message||'Failed') } finally { setChoosing('') }
  }
  useEffect(()=>{ (async()=>{ try { const { data } = await axios.get('/api/mentors'); setMentors(data.mentors) } catch(e){ console.error(e) } finally { setLoading(false) } })() }, [])
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h2 className="font-semibold mb-3">Mentors</h2>
      {loading ? <p className="text-sm text-gray-500">Loading…</p> : mentors.length===0 ? <p className="text-sm text-gray-500">No mentors yet.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map(m => (
            <div key={m.id} className="rounded-xl border p-4 bg-white space-y-1">
              <p className="font-medium">{m.name}</p>
              <p className="text-xs text-gray-500">{m.email}</p>
              <p className="text-xs text-gray-500">{m.phone || 'No phone'}</p>
              <button disabled={choosing===m.id} onClick={()=>choose(m.id)} className="mt-2 text-xs px-3 py-1 rounded bg-sky-600 text-white disabled:opacity-50">{choosing===m.id?'Choosing…':'Choose Mentor'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfilePage() {
  const [form, setForm] = useState({ name: '', goal: '', skills: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const load = async () => {
    try { const { data } = await axios.get('/api/user/profile', { withCredentials: true }); if (data.user) setForm({ name: data.user.name||'', goal: data.user.goal||'', skills: (data.user.skills||[]).join(', ') }) } catch(e){ console.error(e) } finally { setLoading(false) }
  }
  useEffect(()=>{ load() }, [])
  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMessage('')
    try {
      const skillsArr = form.skills.split(/[,\n]/).map(s=>s.trim()).filter(Boolean)
      await axios.patch('/api/user/profile', { name: form.name, goal: form.goal, skills: skillsArr }, { withCredentials: true })
      setMessage('Saved')
    } catch(e){ setMessage('Error saving') } finally { setSaving(false) }
  }
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-2xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Profile Settings</h2>
        {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
          <form className="space-y-3" onSubmit={save}>
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Full name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Career goal" value={form.goal} onChange={e=>setForm({...form, goal:e.target.value})} />
            <textarea className="w-full border rounded-lg px-3 py-2 h-24" placeholder="Skills (comma separated)" value={form.skills} onChange={e=>setForm({...form, skills:e.target.value})}></textarea>
            <button disabled={saving} className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60">{saving? 'Saving…':'Save changes'}</button>
            {message && <p className="text-xs text-gray-500">{message}</p>}
          </form>
        )}
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h3 className="font-semibold mb-2">Tips</h3>
        <p className="text-sm text-gray-600">Keep your skills updated to get better recommendations.</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
  <Route path="/mentors" element={<MentorsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  )
}
