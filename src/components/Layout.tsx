import { Outlet, Link } from 'react-router-dom'
import { GraduationCap, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-on-primary px-4 py-3 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
          <span>EduNova</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span>{user.username}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 bg-primary-dark px-3 py-1.5 rounded-lg transition-colors duration-200 hover:bg-black/20 cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Déconnexion
            </button>
          </div>
        )}
      </header>
      <main className="p-6 max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
