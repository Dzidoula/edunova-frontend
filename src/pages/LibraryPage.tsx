import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Folder, FileText, Trash2 } from 'lucide-react'
import { listDocuments, deleteDocument } from '../api/documents'
import type { Document } from '../api/documents'
import { ErrorBanner } from '../components/ErrorBanner'

export function LibraryPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [error, setError] = useState<string | null>(null)

  function reload() {
    listDocuments()
      .then(setDocuments)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement.'))
  }

  useEffect(reload, [])

  async function handleDelete(doc: Document) {
    if (!window.confirm(`Supprimer « ${doc.title} » ?`)) return
    try {
      await deleteDocument(doc.id)
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.')
    }
  }

  const bySubject = documents.reduce<Record<string, Document[]>>((acc, doc) => {
    acc[doc.subject] = acc[doc.subject] || []
    acc[doc.subject].push(doc)
    return acc
  }, {})

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-4 text-foreground">
        <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
        Ma bibliothèque
      </h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {documents.length === 0 && (
        <p className="text-muted-foreground">Aucun document. Importe un PDF pour commencer.</p>
      )}
      {Object.entries(bySubject).map(([subject, docs]) => (
        <div key={subject} className="mb-6">
          <h2 className="flex items-center gap-2 font-semibold mb-2 text-foreground">
            <Folder className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{subject}</span>
          </h2>
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3 mb-2 transition-shadow duration-200 hover:shadow-sm"
            >
              <span className="flex items-center gap-2 text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {doc.title}
              </span>
              <div className="flex gap-2">
                <Link
                  to={`/documents/${doc.id}`}
                  className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-primary-dark"
                >
                  Ouvrir
                </Link>
                <button
                  onClick={() => handleDelete(doc)}
                  className="flex items-center gap-1 bg-red-50 text-destructive px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-red-100 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
