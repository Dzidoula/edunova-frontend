import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ACTIONS = [
  { to: '/library', icon: '📚', title: 'Ma bibliothèque', sub: 'Documents importés' },
  { to: '/chat', icon: '🤖', title: "Demander à l'IA", sub: 'Chat libre' },
  { to: '/import', icon: '📷', title: 'Importer un document', sub: 'PDF ou texte' },
  { to: '/train', icon: '📝', title: "M'entraîner", sub: 'Exercices guidés' },
  { to: '/progress', icon: '📈', title: 'Ma progression', sub: 'Niveaux 🟢🟡🔴' },
  { to: '/settings', icon: '⚙️', title: 'Paramètres', sub: 'Clé API, OCR' },
]

export function HomePage() {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Bonjour {user?.username} 👋</h1>
      <p className="text-slate-500 mb-6">Que veux-tu faire aujourd'hui ?</p>
      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map((a) => (
          <Link key={a.to} to={a.to} className="bg-white border rounded p-4 hover:bg-slate-50">
            <div className="text-2xl">{a.icon}</div>
            <div className="font-semibold mt-1">{a.title}</div>
            <div className="text-sm text-slate-500">{a.sub}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
