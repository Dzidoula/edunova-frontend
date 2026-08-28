import { Link } from 'react-router-dom'
import { BookOpen, Bot, ScanLine, PencilLine, LineChart, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ACTIONS: { to: string; icon: LucideIcon; title: string; sub: string }[] = [
  { to: '/library', icon: BookOpen, title: 'Ma bibliothèque', sub: 'Documents importés' },
  { to: '/chat', icon: Bot, title: "Demander à l'IA", sub: 'Chat libre' },
  { to: '/import', icon: ScanLine, title: 'Importer un document', sub: 'PDF ou texte' },
  { to: '/train', icon: PencilLine, title: "M'entraîner", sub: 'Exercices guidés' },
  { to: '/progress', icon: LineChart, title: 'Ma progression', sub: 'Suivre mes niveaux' },
  { to: '/settings', icon: Settings, title: 'Paramètres', sub: 'Clé API, OCR' },
]

export function HomePage() {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-foreground">Bonjour {user?.username} 👋</h1>
      <p className="text-muted-foreground mb-6">Que veux-tu faire aujourd'hui ?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACTIONS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group bg-white border border-border rounded-2xl p-5 transition-all duration-200 hover:border-primary hover:shadow-md"
          >
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-muted text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-on-primary">
              <a.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="font-semibold mt-3 text-foreground">{a.title}</div>
            <div className="text-sm text-muted-foreground">{a.sub}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
