import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileText,
  Bot,
  HelpCircle,
  ClipboardList,
  PencilLine,
  ScanSearch,
  Frown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getDocument, updateDocumentText, rerunOcr } from '../api/documents'
import type { Document } from '../api/documents'
import { ErrorBanner } from '../components/ErrorBanner'

const OPTIONS: { icon: LucideIcon; label: string; prompt: string }[] = [
  { icon: Frown, label: 'Je ne comprends pas tout', prompt: 'Je ne comprends pas tout le document, aide-moi à le découper.' },
  { icon: ClipboardList, label: 'Résume le document', prompt: 'Fais-moi un résumé clair et structuré de ce document.' },
  { icon: PencilLine, label: 'Aide sur un exercice', prompt: 'Aide-moi sur un exercice de ce document, guide-moi étape par étape.' },
  { icon: HelpCircle, label: 'Pose-moi des questions', prompt: 'Pose-moi 3 questions pour vérifier ma compréhension.' },
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
  if (!doc) return <p className="text-muted-foreground">Chargement…</p>

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-1 text-foreground">
        <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
        <span>{doc.title}</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        {doc.subject} · {doc.document_type}
      </p>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white border border-border rounded-2xl p-5">
          {isEditing ? (
            <div>
              <textarea
                aria-label="Texte du document"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 mb-2 whitespace-pre-wrap transition-colors duration-200 focus:border-primary"
                rows={12}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveText}
                  disabled={isSavingText}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold transition-colors duration-200 hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
                >
                  {isSavingText ? 'Enregistrement…' : 'Enregistrer le texte'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSavingText}
                  className="bg-white border border-border rounded-lg px-4 py-2 transition-colors duration-200 hover:bg-muted cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap mb-3 text-foreground">
                {doc.has_content ? doc.extracted_text : "Aucun texte extractible pour l'instant."}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 bg-white border border-border rounded-lg px-4 py-2 text-sm transition-colors duration-200 hover:bg-muted cursor-pointer"
                >
                  <PencilLine className="h-4 w-4" aria-hidden="true" />
                  <span>Modifier le texte</span>
                </button>
                <button
                  onClick={handleRerunOcr}
                  disabled={isRerunningOcr}
                  className="flex items-center gap-1.5 bg-white border border-border rounded-lg px-4 py-2 text-sm transition-colors duration-200 hover:bg-muted disabled:opacity-50 cursor-pointer"
                >
                  <ScanSearch className="h-4 w-4" aria-hidden="true" />
                  <span>{isRerunningOcr ? "Relance de l'OCR…" : "Relancer l'OCR"}</span>
                </button>
              </div>
            </>
          )}
        </div>
        <div className="md:w-72 flex flex-col gap-2">
          <Link
            to={`/chat?document_id=${doc.id}`}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary text-center px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 hover:bg-primary-dark"
          >
            <Bot className="h-4 w-4" aria-hidden="true" />
            <span>Étudier avec l'IA</span>
          </Link>
          {OPTIONS.map((opt) => (
            <Link
              key={opt.label}
              to={`/chat?document_id=${doc.id}&prompt=${encodeURIComponent(opt.prompt)}`}
              className="flex items-center gap-2 bg-white border border-border rounded-lg px-4 py-2 text-sm transition-colors duration-200 hover:border-primary hover:bg-muted"
            >
              <opt.icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>{opt.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
