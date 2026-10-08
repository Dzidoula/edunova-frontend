import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ErrorBanner } from '../components/ErrorBanner'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-purple-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm border border-border">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <GraduationCap className="h-8 w-8" aria-hidden="true" />
          <h1 className="text-xl font-bold text-foreground">EduNova</h1>
        </div>
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        <label htmlFor="username" className="block text-sm font-medium mb-1 text-foreground">
          Ton pseudo
        </label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2.5 mb-4 transition-colors duration-200 focus:border-primary"
          placeholder="ex: koffi"
        />
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2.5 mb-4 transition-colors duration-200 focus:border-primary"
          placeholder="6 caractères minimum"
        />
        <button
          type="submit"
          className="w-full bg-primary text-on-primary rounded-lg py-2.5 font-semibold transition-colors duration-200 hover:bg-primary-dark cursor-pointer"
        >
          Entrer
        </button>
      </form>
    </div>
  )
}
