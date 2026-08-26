import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProgress } from '../api/progress'
import type { Progress } from '../api/progress'

const DEFAULT_NOTIONS = ['Factorisation', 'Équations', 'Fractions']

export function TrainPage() {
  const [weak, setWeak] = useState<Progress[]>([])

  useEffect(() => {
    listProgress()
      .then((all) => setWeak(all.filter((p) => p.mastery === 'difficulty' || p.mastery === 'to_strengthen')))
      .catch(() => setWeak([]))
  }, [])

  const notions = weak.length > 0 ? weak.map((p) => ({ name: p.notion_name, subject: p.subject })) : DEFAULT_NOTIONS.map((n) => ({ name: n, subject: 'Mathématiques' }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📝 M'entraîner</h1>
      {notions.map((n) => (
        <Link
          key={n.name}
          to={`/exercise/${encodeURIComponent(n.name)}/${encodeURIComponent(n.subject)}`}
          className="block bg-white border rounded px-4 py-3 mb-2 hover:bg-slate-50"
        >
          {n.name}
        </Link>
      ))}
    </div>
  )
}
