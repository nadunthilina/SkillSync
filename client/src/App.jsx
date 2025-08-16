import { useEffect, useState } from 'react'
import { Routes, Route, Link, NavLink, Outlet } from 'react-router-dom'
import axios from 'axios'
import { Brain, LineChart, Users2, MessageSquareText, User, LogOut, Search, Menu } from 'lucide-react'

const brand = {
  name: 'SkillSync',
  gradient: 'bg-gradient-to-r from-sky-500 via-teal-500 to-blue-600',
}

function HealthDot() {
  const [status, setStatus] = useState('loading') // loading | ok | fail
  useEffect(() => {
    axios.get('http://localhost:4000/api/health').then(() => setStatus('ok')).catch(() => setStatus('fail'))
  }, [])
  const color = status === 'ok' ? 'bg-emerald-500' : status === 'fail' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'
  return <span title={`API: ${status}`} className={`inline-block h-2.5 w-2.5 rounded-full ${color}`}></span>
}

function LandingPage() {
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
            <Link to="/login" className="px-3 py-1.5 text-sm rounded-lg border">Log in</Link>
            <Link to="/register" className="px-3 py-1.5 text-sm rounded-lg text-white bg-sky-600 hover:bg-sky-700">Get Started</Link>
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
                <Link to="/register" className="px-5 py-3 rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-sm">Get Started</Link>
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
          <form className="space-y-4">
            {mode === 'register' && (
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Name" />
            )}
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" type="email" />
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Password" type="password" />
            <button type="button" className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
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
  const [open, setOpen] = useState(false)
  const nav = [
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
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-sky-50 text-sky-700' : 'hover:bg-gray-50'}`}>
              {n.icon}
              <span className="text-sm">{n.label}</span>
            </NavLink>
          ))}
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 w-full text-left"><LogOut className="h-5 w-5" /><span className="text-sm">Logout</span></button>
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
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-semibold mb-3">Progress Overview</h2>
          <div className="h-40 grid place-items-center text-gray-400">[Charts placeholder]</div>
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

function AnalyzerPage() {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 rounded-2xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Skill Analyzer</h2>
        <form className="space-y-3">
          <select className="w-full border rounded-lg px-3 py-2">
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Data Scientist</option>
          </select>
          <textarea className="w-full border rounded-lg px-3 py-2 h-28" placeholder="Your current skills (comma separated)"></textarea>
          <button type="button" className="w-full px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">Analyze</button>
        </form>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-semibold mb-2">Missing Skills</h3>
          <div className="flex flex-wrap gap-2">
            {['TypeScript','Redux','Testing'].map(s => <span key={s} className="px-3 py-1.5 text-sm rounded-full bg-emerald-50 text-emerald-700 border">{s}</span>)}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-semibold mb-3">Recommended Resources</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl border overflow-hidden bg-white">
                <div className="h-28 bg-gradient-to-tr from-sky-200 to-blue-200"/>
                <div className="p-4">
                  <p className="font-medium">Course {i}</p>
                  <p className="text-xs text-gray-500">Coursera / YouTube</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RoadmapPage() {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h2 className="font-semibold mb-3">Learning Roadmap</h2>
      <div className="overflow-x-auto">
        <div className="min-w-[700px] grid grid-cols-6 gap-3 text-sm">
          {['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6'].map((w) => <div key={w} className="text-center text-gray-500">{w}</div>)}
          {[1,2,3].map((row) => (
            <div key={row} className="col-span-6 h-16 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 rounded-lg bg-sky-100 border text-sky-700 px-3 grid place-items-center" style={{ width: `${40 + row*10}%` }}>Task {row}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatPage() {
  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4">
      <div className="rounded-2xl border bg-white p-4 space-y-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="p-3 rounded-lg hover:bg-gray-50 border">Mentor {i}</div>
        ))}
      </div>
      <div className="rounded-2xl border bg-white flex flex-col">
        <div className="border-b p-3 font-medium">Chat with Mentor 1</div>
        <div className="flex-1 p-4 space-y-3">
          <div className="max-w-sm rounded-2xl px-3 py-2 bg-gray-100">Hello! How can I help?</div>
          <div className="max-w-sm rounded-2xl px-3 py-2 bg-sky-600 text-white ml-auto">I need advice on React performance.</div>
        </div>
        <div className="border-t p-3 flex gap-2">
          <input className="flex-1 border rounded-lg px-3 py-2" placeholder="Type a message..." />
          <button className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">Send</button>
        </div>
      </div>
    </div>
  )
}

function ProfilePage() {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-2xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Profile Settings</h2>
        <form className="space-y-3">
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Full name" />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Career goal" />
          <textarea className="w-full border rounded-lg px-3 py-2 h-24" placeholder="Skills (comma separated)"></textarea>
          <div>
            <label className="text-sm text-gray-600">Profile picture</label>
            <input type="file" className="mt-1 block w-full text-sm" />
          </div>
          <button className="px-4 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700">Save changes</button>
        </form>
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
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
