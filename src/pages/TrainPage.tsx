import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PencilLine, ChevronRight } from 'lucide-react'
import { listProgress } from '../api/progress'
import type { Progress } from '../api/progress'
import { ErrorBanner } from '../components/ErrorBanner'

const DEFAULT_NOTIONS = ['Factorisation', 'Équations', 'Fractions']

export function TrainPage() {
  const [weak, setWeak] = useState<Progress[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    listProgress()
      .then((all) => {
        setWeak(all.filter((p) => p.mastery === 'difficulty' || p.mastery === 'to_strengthen'))
        setLoaded(true)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Chargement des notions impossible.')
      })
  }, [])

  // Only fall back to the default notions once we know (from a successful, empty fetch)
  // that the learner genuinely has no weak notions — not when the fetch failed.
  const notions =
    weak.length > 0
      ? weak.map((p) => ({ name: p.notion_name, subject: p.subject }))
      : loaded
        ? DEFAULT_NOTIONS.map((n) => ({ name: n, subject: 'Mathématiques' }))
        : []

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-4 text-foreground">
        <PencilLine className="h-6 w-6 text-primary" aria-hidden="true" />
        M'entraîner
      </h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {notions.map((n) => (
        <Link
          key={n.name}
          to={`/exercise/${encodeURIComponent(n.name)}/${encodeURIComponent(n.subject)}`}
          className="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3 mb-2 text-foreground transition-colors duration-200 hover:border-primary hover:bg-muted"
        >
          {n.name}
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </Link>
      ))}
    </div>
  )
}
