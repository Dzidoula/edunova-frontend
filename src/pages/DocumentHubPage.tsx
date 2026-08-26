import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDocument, updateDocumentText, rerunOcr } from '../api/documents'
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
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [isSavingText, setIsSavingText] = useState(false)
  const [isRerunningOcr, setIsRerunningOcr] = useState(false)

  useEffect(() => {
    if (!id) return
    getDocument(id)
      .then(setDoc)
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible.'))
  }, [id])

  function startEditing() {
    if (!doc) return
    setEditedText(doc.extracted_text)
    setIsEditing(true)
  }

  async function handleSaveText() {
    if (!doc) return
    setIsSavingText(true)
    setError(null)
    try {
      const updated = await updateDocumentText(doc.id, editedText)
      setDoc(updated)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer le texte.")
    } finally {
      setIsSavingText(false)
    }
  }

  async function handleRerunOcr() {
    if (!doc) return
    setIsRerunningOcr(true)
    setError(null)
    try {
      const updated = await rerunOcr(doc.id)
      setDoc(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de relancer l'OCR.")
    } finally {
      setIsRerunningOcr(false)
    }
  }

  if (!doc && error) return <ErrorBanner message={error} onDismiss={() => setError(null)} />
  if (!doc) return <p>Chargement…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">
        <span aria-hidden="true">📄</span> <span>{doc.title}</span>
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        {doc.subject} · {doc.document_type}
      </p>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="flex gap-4">
        <div className="flex-1 bg-white border rounded p-4">
          {isEditing ? (
            <div>
              <textarea
                aria-label="Texte du document"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-2 whitespace-pre-wrap"
                rows={12}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveText}
                  disabled={isSavingText}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
                >
                  {isSavingText ? 'Enregistrement…' : 'Enregistrer le texte'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSavingText}
                  className="bg-white border rounded px-4 py-2"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap mb-3">
                {doc.has_content ? doc.extracted_text : "Aucun texte extractible pour l'instant."}
              </div>
              <div className="flex gap-2">
                <button onClick={startEditing} className="bg-white border rounded px-4 py-2 hover:bg-slate-50">
                  <span aria-hidden="true">✏️</span> <span>Modifier le texte</span>
                </button>
                <button
                  onClick={handleRerunOcr}
                  disabled={isRerunningOcr}
                  className="bg-white border rounded px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
                >
                  <span aria-hidden="true">🔎</span>{' '}
                  <span>{isRerunningOcr ? "Relance de l'OCR…" : "Relancer l'OCR"}</span>
                </button>
              </div>
            </>
          )}
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
