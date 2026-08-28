import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PencilLine, CheckCircle2, XCircle, PartyPopper, ArrowRight } from 'lucide-react'
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

function ExerciseTitle({ notion }: { notion: string }) {
  return (
    <h1 className="flex items-center gap-2 text-2xl font-bold mb-4 text-foreground">
      <PencilLine className="h-6 w-6 text-primary" aria-hidden="true" />
      {notion}
    </h1>
  )
}

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
        <ExerciseTitle notion={notion} />
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        <p className="flex items-center gap-2 mb-4 text-success font-medium">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          Résultat enregistré.
        </p>
        {analysis && (
          <div className="bg-white border border-border rounded-2xl p-5">
            <p className="font-semibold text-foreground">{analysis.summary}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{analysis.strategy}</p>
          </div>
        )}
      </div>
    )
  }

  if (stepIndex >= STEPS.length) {
    return (
      <div>
        <ExerciseTitle notion={notion} />
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        <p className="flex items-center gap-2 font-semibold mb-4 text-foreground">
          <PartyPopper className="h-5 w-5 text-primary" aria-hidden="true" />
          Terminé !
        </p>
        <textarea
          value={learnerNote}
          onChange={(e) => setLearnerNote(e.target.value)}
          placeholder="Qu'est-ce qui a bloqué ? (optionnel)"
          className="w-full border border-border rounded-lg px-3 py-2 mb-4 transition-colors duration-200 focus:border-primary"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            onClick={() => mark(true)}
            className="flex items-center gap-1.5 bg-success text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 hover:brightness-110 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Réussi
          </button>
          <button
            onClick={() => mark(false)}
            className="flex items-center gap-1.5 bg-destructive text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 hover:brightness-110 cursor-pointer"
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            À revoir
          </button>
        </div>
      </div>
    )
  }

  const step = STEPS[stepIndex]
  return (
    <div>
      <ExerciseTitle notion={notion} />
      <div className="bg-white border border-border rounded-2xl p-5 mb-4">
        <p className="font-semibold text-foreground">
          Étape {stepIndex + 1}/{STEPS.length} — {step.title}
        </p>
        <p className="mt-2 text-foreground">{step.prompt(notion)}</p>
      </div>
      <button
        onClick={() => setStepIndex((i) => i + 1)}
        className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold transition-colors duration-200 hover:bg-primary-dark cursor-pointer"
      >
        Étape suivante
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
