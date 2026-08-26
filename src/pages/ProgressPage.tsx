import { useEffect, useState } from 'react'
import { listProgress } from '../api/progress'
import type { Progress } from '../api/progress'
import { listMemories } from '../api/memory'
import type { Memory } from '../api/memory'
import { MasteryBadge } from '../components/MasteryBadge'
import { ErrorBanner } from '../components/ErrorBanner'

export function ProgressPage() {
  const [progress, setProgress] = useState<Progress[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listProgress(), listMemories()])
      .then(([p, m]) => {
        setProgress(p)
        setMemories(m)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible.'))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        <span aria-hidden="true">📈</span> <span>Ma progression</span>
      </h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {progress.length === 0 && <p className="text-slate-500">Pas encore de données de progression.</p>}
      {progress.map((p) => (
        <div key={p.notion_name} className="flex items-center justify-between bg-white border rounded px-4 py-2 mb-2">
          <span>{p.notion_name}</span>
          <MasteryBadge mastery={p.mastery} />
        </div>
      ))}
      {memories.length > 0 && (
        <>
          <h2 className="font-semibold mt-6 mb-2">Derniers souvenirs pédagogiques</h2>
          {memories.slice(0, 8).map((m) => (
            <p key={m.id} className="text-sm text-slate-600 mb-1">
              <span aria-hidden="true">•</span> <span>[{m.memory_type}]</span> <span>{m.content}</span>
            </p>
          ))}
        </>
      )}
    </div>
  )
}
