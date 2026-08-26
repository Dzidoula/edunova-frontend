import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold">
          📘 EduNova
        </Link>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span>{user.username}</span>
            <button onClick={logout} className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">
              Déconnexion
            </button>
          </div>
        )}
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
