import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { recordResult } from '../api/progress'
import type { ErrorAnalysis } from '../api/progress'
import { ErrorBanner } from '../components/ErrorBanner'

const STEPS = [
  { title: 'Comprendre', prompt: (notion: string) => `Que demande-t-on sur « ${notion} » ?` },
  { title: 'Données', prompt: () => 'Quelles informations as-tu ?' },
  { title: 'Méthode', prompt: (notion: string) => `Quelle méthode pour « ${notion} » ?` },
  { title: 'Appliquer', prompt: () => 'Écris ta résolution.' },
  { title: 'Vérifier', prompt: () => 'Comment vérifier le résultat ?' },
]

export function ExercisePage() {
  const { notion = '', subject = '' } = useParams<{ notion: string; subject: string }>()
  const [stepIndex, setStepIndex] = useState(0)
  const [learnerNote, setLearnerNote] = useState('')
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  async function mark(success: boolean) {
    setError(null)
    try {
      const result = await recordResult({ notion, subject, success, learnerNote })
      setAnalysis(result.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.')
    }
  }

  if (analysis !== undefined) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">📝 {notion}</h1>
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        <p className="mb-4">✅ Résultat enregistré.</p>
        {analysis && (
          <div className="bg-white border rounded p-4">
            <p className="font-semibold">{analysis.summary}</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap mt-2">{analysis.strategy}</p>
          </div>
        )}
      </div>
    )
  }

  if (stepIndex >= STEPS.length) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">📝 {notion}</h1>
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        <p className="font-semibold mb-4">🎉 Terminé !</p>
        <textarea
          value={learnerNote}
          onChange={(e) => setLearnerNote(e.target.value)}
          placeholder="Qu'est-ce qui a bloqué ? (optionnel)"
          className="w-full border rounded px-3 py-2 mb-4"
          rows={3}
        />
        <div className="flex gap-2">
          <button onClick={() => mark(true)} className="bg-green-600 text-white px-4 py-2 rounded font-semibold">
            ✓ Réussi
          </button>
          <button onClick={() => mark(false)} className="bg-red-600 text-white px-4 py-2 rounded font-semibold">
            ✗ À revoir
          </button>
        </div>
      </div>
    )
  }

  const step = STEPS[stepIndex]
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📝 {notion}</h1>
      <div className="bg-white border rounded p-4 mb-4">
        <p className="font-semibold">
          Étape {stepIndex + 1}/{STEPS.length} — {step.title}
        </p>
        <p className="mt-2">{step.prompt(notion)}</p>
      </div>
      <button
        onClick={() => setStepIndex((i) => i + 1)}
        className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
      >
        Étape suivante →
      </button>
    </div>
  )
}
