import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDocument } from '../api/documents'
import type { Document } from '../api/documents'
import { ErrorBanner } from '../components/ErrorBanner'

const OPTIONS: { icon: string; label: string; prompt: string }[] = [
  { icon: '😕', label: 'Je ne comprends pas tout', prompt: 'Je ne comprends pas tout le document, aide-moi à le découper.' },
  { icon: '📋', label: 'Résume le document', prompt: 'Fais-moi un résumé clair et structuré de ce document.' },
  { icon: '📝', label: 'Aide sur un exercice', prompt: 'Aide-moi sur un exercice de ce document, guide-moi étape par étape.' },
  { icon: '❓', label: 'Pose-moi des questions', prompt: 'Pose-moi 3 questions pour vérifier ma compréhension.' },
]

export function DocumentHubPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc] = useState<Document | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getDocument(id)
      .then(setDoc)
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible.'))
  }, [id])

  if (error) return <ErrorBanner message={error} onDismiss={() => setError(null)} />
  if (!doc) return <p>Chargement…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">
        <span aria-hidden="true">📄</span> <span>{doc.title}</span>
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        {doc.subject} · {doc.document_type}
      </p>
      <div className="flex gap-4">
        <div className="flex-1 bg-white border rounded p-4 whitespace-pre-wrap">
          {doc.has_content ? doc.extracted_text : "Aucun texte extractible pour l'instant."}
        </div>
        <div className="w-72 flex flex-col gap-2">
          <Link
            to={`/chat?document_id=${doc.id}`}
            className="bg-blue-600 text-white text-center px-4 py-2 rounded font-semibold"
          >
            <span aria-hidden="true">🤖</span> <span>Étudier avec l'IA</span>
          </Link>
          {OPTIONS.map((opt) => (
            <Link
              key={opt.label}
              to={`/chat?document_id=${doc.id}&prompt=${encodeURIComponent(opt.prompt)}`}
              className="bg-white border rounded px-4 py-2 hover:bg-slate-50"
            >
              <span aria-hidden="true">{opt.icon}</span> <span>{opt.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
