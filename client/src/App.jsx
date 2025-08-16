import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [health, setHealth] = useState('Checking...')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/health', { withCredentials: true })
        setHealth(res.data?.message || 'OK')
      } catch (err) {
        setHealth('Failed')
      }
    }
    fetchHealth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-xl w-full bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">SkillSync Client</h1>
        <p className="text-gray-600 mb-4">Frontend powered by React + Vite + TailwindCSS</p>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-1">Backend Health</h2>
          <p>
            Status: <span className={health === 'OK' ? 'text-green-600' : 'text-red-600'}>{health}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">GET http://localhost:4000/api/health</p>
        </div>
      </div>
    </div>
  )
}

export default App
