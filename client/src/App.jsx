import { useEffect, useState } from 'react'
import Logo from './assets/SkillSync.png'
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

// Branding image used in multiple spots; gradient block replaced with logo

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
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirm: '', mentor: false })
  const [forgotForm, setForgotForm] = useState({ email: '' })
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [hp, setHp] = useState('')
  const [mentorsPreview, setMentorsPreview] = useState([])
  const [mentorsLoading, setMentorsLoading] = useState(true)

  useEffect(()=>{ (async()=>{
    try { const { data } = await axios.get('/api/mentors'); setMentorsPreview(data.mentors.slice(0,6)) } catch(e){ /* silent */ } finally { setMentorsLoading(false) }
  })() }, [])

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
  await signup(name, email, pw, signupForm.mentor ? 'mentor' : undefined)
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
            <img src={Logo} alt="SkillSync" className="h-8 w-8 rounded-lg object-cover" />
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
                  <div className="h-10 w-10 rounded-xl overflow-hidden border bg-white">
                    <img src={Logo} alt="SkillSync" className="h-full w-full object-cover" />
                  </div>
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

        {/* How It Works */}
        <section id="how" className="bg-white/60 border-y">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="max-w-2xl mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-3">How it works</h2>
              <p className="text-gray-600">A simple, guided loop that keeps you learning the right things at the right time.</p>
            </div>
            <ol className="grid md:grid-cols-5 gap-5 text-sm">
              {[{
                t:'Create account',d:'Set your role & goals.'},{t:'Analyze skills',d:'We detect strengths & gaps.'},{t:'Get roadmap',d:'Auto‑generated weekly plan.'},{t:'Connect mentor',d:'Book guidance & feedback.'},{t:'Track progress',d:'Visualize growth over time.'}].map((s,i)=>(
                  <li key={s.t} className="relative group rounded-2xl border bg-white p-5 shadow-sm">
                    <span className="absolute -top-3 -left-3 h-8 w-8 rounded-xl bg-sky-600 text-white grid place-items-center text-xs font-semibold shadow">{i+1}</span>
                    <p className="font-medium mb-1">{s.t}</p>
                    <p className="text-gray-600 text-xs leading-relaxed">{s.d}</p>
                  </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Mentors Preview */}
        <section id="mentors" className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight mb-3">Featured mentors</h2>
              <p className="text-gray-600 text-sm">Industry professionals ready to help you close your gaps faster.</p>
            </div>
            <div>
              <Link to="/mentors" className="inline-flex items-center gap-1 text-sm text-sky-700 font-medium hover:underline">Browse all →</Link>
            </div>
          </div>
          {mentorsLoading ? (
            <div className="h-32 grid place-items-center text-gray-400 text-sm">Loading mentors…</div>
          ) : mentorsPreview.length === 0 ? (
            <p className="text-sm text-gray-500">No mentors yet. Check back soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentorsPreview.map(m => (
                <div key={m.id} className="relative rounded-2xl border bg-white p-5 shadow-sm hover:shadow transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold leading-tight">{m.name}</p>
                      <p className="text-[11px] text-gray-500">{m.email}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white grid place-items-center text-xs font-medium">{(m.name||'?').slice(0,1)}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(m.expertise||[]).slice(0,4).map(tag => <span key={tag} className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border text-[11px]">{tag}</span>)}
                    {(m.expertise||[]).length>4 && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px]">+{(m.expertise||[]).length-4}</span>}
                  </div>
                  <button onClick={()=>navigate('/mentors')} className="mt-auto text-xs px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700">Connect</button>
                </div>
              ))}
            </div>
          )}
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
          <label className="flex items-center gap-2 text-xs text-gray-600 select-none"><input type="checkbox" checked={signupForm.mentor} onChange={e=>setSignupForm({...signupForm, mentor: e.target.checked})} /> Apply to become a mentor (requires admin approval)</label>
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
            <img src={Logo} alt="SkillSync" className="h-8 w-8 rounded-lg object-cover" />
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
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const baseNav = [
    { to: '/dashboard', label: 'Dashboard', icon: <LineChart className="h-5 w-5" /> },
    { to: '/analyzer', label: 'Skill Analyzer', icon: <Brain className="h-5 w-5" /> },
    { to: '/roadmap', label: 'Roadmap', icon: <LineChart className="h-5 w-5" /> },
    { to: '/mentors', label: 'Mentors', icon: <Users2 className="h-5 w-5" /> },
    { to: '/chat', label: 'Chat', icon: <MessageSquareText className="h-5 w-5" /> },
    { to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ]
  const mentorExtra = [
    { to: '/mentor/overview', label: 'Mentor Home', icon: <Users2 className="h-5 w-5" /> },
    { to: '/mentor/mentees', label: 'Mentees', icon: <Users2 className="h-5 w-5" /> },
    { to: '/mentor/availability', label: 'Availability', icon: <LineChart className="h-5 w-5" /> },
  ]
  const navItems = user?.role === 'mentor' ? [...mentorExtra, ...baseNav] : baseNav
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className={`border-r bg-white ${open ? 'block' : 'hidden'} md:block`}>
        <div className="h-14 border-b px-4 flex items-center gap-2">
          <img src={Logo} alt="SkillSync" className="h-8 w-8 rounded-lg object-cover" />
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
  const [mentorStatus, setMentorStatus] = useState(null)
  useEffect(()=>{ (async()=>{ try { const { data } = await axios.get('/api/user/progress', { withCredentials:true }); setProgress(data.progress) } catch(e){ console.error(e) } finally { setLoading(false) } })() }, [])
  useEffect(()=>{ (async()=>{ try { const { data } = await axios.get('/api/user/mentor-application/status', { withCredentials:true }); setMentorStatus(data) } catch(e){ /*silent*/ } })() }, [])
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {mentorStatus && mentorStatus.status==='pending' && (
          <div className="rounded-2xl border bg-amber-50 p-4 text-sm flex items-start gap-3">
            <div className="mt-0.5">⏳</div>
            <div>
              <p className="font-medium text-amber-800 mb-0.5">Mentor application under review</p>
              <p className="text-amber-700 text-xs">You'll be notified once an admin approves it. You currently have standard user access.</p>
            </div>
          </div>
        )}
        {mentorStatus && mentorStatus.status==='rejected' && (
          <div className="rounded-2xl border bg-rose-50 p-4 text-sm flex items-start gap-3">
            <div className="mt-0.5">❌</div>
            <div>
              <p className="font-medium text-rose-800 mb-0.5">Mentor application rejected</p>
              <p className="text-rose-700 text-xs">{mentorStatus.application?.notes || 'You can improve your profile and re-apply later.'}</p>
            </div>
          </div>
        )}
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
  const [input, setInput] = useState('react, javascript, css')
  const [skills, setSkills] = useState(['react','javascript','css'])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAllTarget, setShowAllTarget] = useState(false)
  const [customRoleName, setCustomRoleName] = useState('')
  const [customRoleSkills, setCustomRoleSkills] = useState('')

  // Role -> canonical skills list mapping (sync with backend)
  const roleTarget = {
    'Frontend Developer': ['javascript','react','css','html','testing','typescript'],
    'Backend Developer': ['node','express','mongodb','sql','api design','testing'],
    'Data Scientist': ['python','statistics','pandas','numpy','ml','sql']
  }
  const customTargets = customRoleSkills.split(/[,\n]/).map(s=>s.trim().toLowerCase()).filter(Boolean)
  const targetList = role === '__custom__' ? customTargets : (roleTarget[role] || [])
  const remainingSuggestions = targetList.filter(s=> !skills.includes(s))

  const addSkill = (raw) => {
    const s = raw.trim().toLowerCase()
    if (!s) return
    if (skills.includes(s)) return
    setSkills(prev => [...prev, s])
  }
  const removeSkill = (s) => setSkills(list => list.filter(x=>x!==s))
  const parseInput = () => {
    input.split(/[\n,]/).map(s=>s.trim()).filter(Boolean).forEach(addSkill)
    setInput('')
  }
  const analyze = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const skillsText = skills.join(', ')
      const { data } = await axios.post('/api/analyzer/analyze', { role, skillsText }, { withCredentials: true })
      setResult(data)
    } catch(e){ setError(e.response?.data?.message || 'Analyze failed') } finally { setLoading(false) }
  }
  const copyMissing = () => { if (result) navigator.clipboard.writeText(result.missingSkills.join(', ')) }
  const exportJSON = () => { if (!result) return; const blob = new Blob([JSON.stringify(result,null,2)], { type:'application/json' }); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='skill-analysis.json'; a.click(); }
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="md:w-72 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Target Role</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={role} onChange={e=>{ setRole(e.target.value); setResult(null) }}>
                {Object.keys(roleTarget).map(r=> <option key={r} value={r}>{r}</option>)}
                <option value="__custom__">Other / Custom…</option>
              </select>
              {role==='__custom__' && (
                <div className="mt-3 space-y-3 rounded-lg border p-3 bg-white/50">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-500">Custom Role Name</label>
                    <input value={customRoleName} onChange={e=>{ setCustomRoleName(e.target.value); setResult(null) }} placeholder="e.g. DevOps Engineer" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-500">Target Skills (comma or newline separated)</label>
                    <textarea value={customRoleSkills} onChange={e=>{ setCustomRoleSkills(e.target.value); setResult(null) }} placeholder="docker, kubernetes, ci/cd, aws" className="w-full border rounded-lg px-3 py-2 text-xs h-20"></textarea>
                  </div>
                  {customTargets.length>0 && <p className="text-[10px] text-gray-500">{customTargets.length} target skills defined.</p>}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Add Skills</label>
              <div className="flex gap-2">
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); parseInput() } }} placeholder="e.g. react, css" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <button onClick={parseInput} className="px-3 py-2 rounded-lg bg-sky-600 text-white text-xs">Add</button>
              </div>
              <p className="text-[10px] text-gray-500">Press Enter or Add. Comma or newline separated.</p>
            </div>
            {remainingSuggestions.length>0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-gray-500">Suggestions</p>
                <div className="flex flex-wrap gap-1">
                  {remainingSuggestions.slice(0,6).map(s=> <button key={s} onClick={()=>addSkill(s)} className="px-2 py-1 rounded-md bg-sky-50 border text-[11px] text-sky-700 hover:bg-sky-100">{s}</button>)}
                  {remainingSuggestions.length>6 && <button onClick={()=>setShowAllTarget(v=>!v)} className="px-2 py-1 rounded-md border text-[11px] bg-white">{showAllTarget?'Hide':'More'}</button>}
                </div>
                {showAllTarget && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {remainingSuggestions.slice(6).map(s=> <button key={s} onClick={()=>addSkill(s)} className="px-2 py-1 rounded-md bg-sky-50 border text-[11px] text-sky-700 hover:bg-sky-100">{s}</button>)}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Your Skills ({skills.length})</label>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto rounded-lg border p-2 bg-gray-50">
                {skills.map(s => (
                  <span key={s} className="group inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border text-[11px]">
                    {s}
                    <button onClick={()=>removeSkill(s)} className="opacity-50 group-hover:opacity-100 text-gray-500 hover:text-rose-600">×</button>
                  </span>
                ))}
                {!skills.length && <span className="text-[11px] text-gray-400">No skills yet</span>}
              </div>
            </div>
            <button onClick={analyze} disabled={loading} className="w-full px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium disabled:opacity-60">{loading?'Analyzing…':'Run Analysis'}</button>
            {error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded">{error}</div>}
          </div>
          <div className="flex-1 space-y-5">
            {!result && !loading && <div className="h-40 grid place-items-center text-gray-400 text-sm">Run the analysis to see gaps</div>}
            {loading && <div className="h-40 grid place-items-center text-gray-400 text-sm animate-pulse">Processing…</div>}
            {result && (
              <div className="space-y-5">
                <div className="rounded-xl border bg-white/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">Missing Skills ({result.missingSkills.length})</h3>
                    <div className="flex gap-2">
                      <button onClick={copyMissing} className="text-[11px] px-2 py-1 rounded-md border bg-white hover:bg-sky-50">Copy</button>
                      <button onClick={exportJSON} className="text-[11px] px-2 py-1 rounded-md border bg-white hover:bg-sky-50">Export JSON</button>
                    </div>
                  </div>
                  {result.missingSkills.length === 0 ? <p className="text-xs text-gray-500">No gaps detected 🎉</p> : (
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map(s => <span key={s} className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px]">{s}</span>)}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border bg-white/50 p-4">
                  <h3 className="font-semibold text-sm mb-3">Recommended Resources</h3>
                  {result.recommendedResources.length === 0 ? <p className="text-xs text-gray-500">None needed</p> : (
                    <div className="space-y-3">
                      {result.recommendedResources.map(r => (
                        <div key={r.skill} className="rounded-lg border p-3 bg-white">
                          <p className="font-medium text-sm mb-1">{r.skill}</p>
                          <ul className="text-[11px] text-gray-600 list-disc pl-4 space-y-0.5">
                            {r.resources.map(res => <li key={res}>{res}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border bg-white/50 p-4">
                  <h3 className="font-semibold text-sm mb-2">Coverage</h3>
                  <p className="text-xs text-gray-500 mb-2">You have {skills.length} / {targetList.length} target skills ({Math.round(skills.filter(s=>targetList.includes(s)).length/targetList.length*100)||0}%).</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-600" style={{ width: `${Math.round(skills.filter(s=>targetList.includes(s)).length/targetList.length*100)||0}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RoadmapPage() {
  const [missing, setMissing] = useState('react testing typescript')
  const [role, setRole] = useState('Frontend Developer')
  const [useCustomRole, setUseCustomRole] = useState(false)
  const [customRole, setCustomRole] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const generate = async () => {
    setLoading(true)
    try {
      const missingSkills = missing.split(/[,\s]/).map(s=>s.trim().toLowerCase()).filter(Boolean)
      const roleName = useCustomRole ? (customRole.trim() || 'Custom Role') : role
      const { data } = await axios.post('/api/roadmap/generate', { role: roleName, missingSkills }, { withCredentials: true })
      setTasks(data.tasks)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Generate Roadmap</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {!useCustomRole ? (
            <div className="flex flex-col gap-2">
              <select className="border rounded-lg px-3 py-2" value={role} onChange={e=>{ setRole(e.target.value); setTasks([]) }}>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Data Scientist</option>
              </select>
              <button type="button" onClick={()=>{ setUseCustomRole(true); setTasks([]) }} className="text-[11px] text-sky-600 underline w-fit">Use custom role</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <input className="border rounded-lg px-3 py-2" value={customRole} onChange={e=>{ setCustomRole(e.target.value); setTasks([]) }} placeholder="Enter any role (e.g., Mobile Engineer, DevOps)" />
              <button type="button" onClick={()=>{ setUseCustomRole(false); setCustomRole('') }} className="text-[11px] text-sky-600 underline w-fit">Back to presets</button>
            </div>
          )}
          <input className="border rounded-lg px-3 py-2 sm:col-span-2" value={missing} onChange={e=>setMissing(e.target.value)} placeholder="Missing skills (comma or space separated)" />
          <button onClick={generate} disabled={loading || (useCustomRole && !customRole.trim())} className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 sm:col-span-3">{loading? 'Generating…':'Generate'}</button>
        </div>
        <p className="mt-2 text-[11px] text-gray-500">You can switch to a custom role to generate a roadmap for any career path.</p>
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
  const { user } = useAuth()
  const [peers, setPeers] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const loadPeers = async () => {
    try { const { data } = await axios.get('/api/chat/conversations', { withCredentials: true }); setPeers(data.mentors) } catch(e){ console.error(e) }
  }
  const loadMessages = async (otherId) => {
    try { const { data } = await axios.get(`/api/chat/messages/${otherId}`, { withCredentials: true }); setMessages(data.messages); setActive(otherId) } catch(e){ console.error(e) }
  }
  const send = async () => {
    if (!active || !text.trim()) return
    const t = text
    setText('')
    try { const { data } = await axios.post(`/api/chat/messages/${active}`, { text: t }, { withCredentials: true }); setMessages(m => [...m, ...data.messages]) } catch(e){ console.error(e) }
  }
  useEffect(()=>{ loadPeers() }, [])
  const emptyLabel = user?.role==='mentor' ? 'No users yet.' : 'No mentors yet.'
  const header = active ? 'Conversation' : (user?.role==='mentor' ? 'Select a user' : 'Select a mentor')
  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-4">
      <div className="rounded-2xl border bg-white p-3 space-y-2">
        {peers.map(p => (
          <button key={p._id} onClick={()=>loadMessages(p._id)} className={`block w-full text-left p-3 rounded-lg border ${active===p._id?'bg-sky-50 border-sky-300':'hover:bg-gray-50'}`}>{p.name || (user?.role==='mentor'?'User':'Mentor')}</button>
        ))}
        {peers.length===0 && <p className="text-xs text-gray-500">{emptyLabel}</p>}
      </div>
      <div className="rounded-2xl border bg-white flex flex-col">
        <div className="border-b p-3 font-medium">{header}</div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {messages.map(m => (
            <div key={m._id} className={`max-w-sm rounded-2xl px-3 py-2 ${m.sender===(user?.role==='mentor'?'mentor':'user')?'bg-sky-600 text-white ml-auto':'bg-gray-100'}`}>{m.text}</div>
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
  const [chosen, setChosen] = useState(null)
  useEffect(()=>{ (async()=>{ try { const { data } = await axios.get('/api/user/profile', { withCredentials:true }); setChosen(data.user?.chosenMentor?._id || data.user?.chosenMentor?.id ) } catch(e){} })() }, [])
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
            <div key={m.id} className={`rounded-xl border p-4 bg-white space-y-1 relative ${chosen===m.id?'ring-2 ring-sky-500':''}`}>
              <p className="font-medium flex items-center gap-2">{m.name} {chosen===m.id && <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] border">Selected</span>}</p>
              <p className="text-xs text-gray-500">{m.email}</p>
              <p className="text-xs text-gray-500">{m.phone || 'No phone'}</p>
              {chosen===m.id ? (
                <div className="mt-2 flex gap-2">
                  <button onClick={()=>{ window.location.href='/chat' }} className="text-xs px-3 py-1 rounded bg-sky-600 text-white">Open Chat</button>
                </div>
              ) : (
                <button disabled={choosing===m.id} onClick={()=>choose(m.id)} className="mt-2 text-xs px-3 py-1 rounded bg-sky-600 text-white disabled:opacity-50">{choosing===m.id?'Choosing…':'Choose Mentor'}</button>
              )}
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
        <Route path="/mentor/overview" element={<MentorHomePage />} />
        <Route path="/mentor/mentees" element={<MentorMenteesPage />} />
        <Route path="/mentor/availability" element={<MentorAvailabilityPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

// Mentor-specific simple pages
function MentorGuard({ children }) {
  const { user } = useAuth()
  if (!user || user.role !== 'mentor') return <div className="text-sm text-gray-500">Not authorized (mentor only).</div>
  return children
}

function MentorHomePage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ (async()=>{ try { const { data } = await axios.get('/api/chat/conversations', { withCredentials:true }); setStats({ mentees: data.mentors?.length||0 }) } catch{} finally { setLoading(false) } })() }, [])
  return <MentorGuard>
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold mb-2">Mentor Overview</h2>
        {loading? <p className="text-sm text-gray-500">Loading…</p> : (
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border p-4 bg-sky-50">
              <p className="text-xs text-gray-500 mb-1">Active Mentees</p>
              <p className="text-2xl font-semibold text-sky-700">{stats.mentees}</p>
            </div>
            <div className="rounded-xl border p-4 bg-teal-50">
              <p className="text-xs text-gray-500 mb-1">Upcoming Sessions</p>
              <p className="text-2xl font-semibold text-teal-700">0</p>
            </div>
            <div className="rounded-xl border p-4 bg-indigo-50">
              <p className="text-xs text-gray-500 mb-1">Unread Messages</p>
              <p className="text-2xl font-semibold text-indigo-700">0</p>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h3 className="font-semibold mb-2 text-sm">Quick Actions</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <button className="px-3 py-2 rounded-lg border bg-white hover:bg-sky-50">Set Availability</button>
          <button className="px-3 py-2 rounded-lg border bg-white hover:bg-sky-50">Create Session Slot</button>
          <button className="px-3 py-2 rounded-lg border bg-white hover:bg-sky-50">Message Mentees</button>
        </div>
      </div>
    </div>
  </MentorGuard>
}

function MentorMenteesPage() {
  const [mentees, setMentees] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ (async()=>{ try { const { data } = await axios.get('/api/mentors', { withCredentials:true }); /* placeholder: would hit a mentor-specific mentees endpoint */ setMentees([]) } catch{} finally { setLoading(false) } })() }, [])
  return <MentorGuard>
    <div className="rounded-2xl border bg-white p-5">
      <h2 className="font-semibold mb-3">Your Mentees</h2>
      {loading? <p className="text-sm text-gray-500">Loading…</p> : mentees.length===0 ? <p className="text-sm text-gray-500">No mentees yet.</p> : (
        <div className="space-y-3">
          {mentees.map(m => <div key={m.id} className="rounded-lg border p-3 flex items-center justify-between"><div><p className="font-medium text-sm">{m.name}</p><p className="text-xs text-gray-500">{m.email}</p></div><button className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs">Message</button></div>)}
        </div>
      )}
    </div>
  </MentorGuard>
}

function MentorAvailabilityPage() {
  const [slots, setSlots] = useState([])
  const [day, setDay] = useState('Mon')
  const [from, setFrom] = useState('09:00')
  const [to, setTo] = useState('10:00')
  const addSlot = () => { if(!day||!from||!to) return; setSlots(s=>[...s,{ id:Date.now(), day, from, to }]) }
  return <MentorGuard>
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Availability</h2>
        <div className="flex flex-wrap gap-2 items-end text-sm">
          <select value={day} onChange={e=>setDay(e.target.value)} className="border rounded-lg px-3 py-2">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=> <option key={d}>{d}</option>)}
          </select>
          <input type="time" value={from} onChange={e=>setFrom(e.target.value)} className="border rounded-lg px-3 py-2" />
          <input type="time" value={to} onChange={e=>setTo(e.target.value)} className="border rounded-lg px-3 py-2" />
          <button onClick={addSlot} className="px-4 py-2 rounded-lg bg-sky-600 text-white">Add Slot</button>
        </div>
        <div className="mt-4 space-y-2">
          {slots.map(s => <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"><span>{s.day} {s.from}-{s.to}</span><button onClick={()=>setSlots(x=>x.filter(y=>y.id!==s.id))} className="text-rose-600 hover:underline">Remove</button></div>)}
          {!slots.length && <p className="text-xs text-gray-500">No slots yet.</p>}
        </div>
        <p className="mt-4 text-[11px] text-gray-500">(Persisting availability to backend not yet implemented.)</p>
      </div>
    </div>
  </MentorGuard>
}
