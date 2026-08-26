import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorBanner } from '../components/ErrorBanner'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(username)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">📘 EduNova</h1>
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Ton pseudo
        </label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="ex: koffi"
        />
        <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700">
          Entrer
        </button>
      </form>
    </div>
  )
}
