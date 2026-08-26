import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
      <h1 className="text-2xl font-bold mb-2">📚 Ma bibliothèque</h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {documents.length === 0 && <p className="text-slate-500">Aucun document. Importe un PDF pour commencer.</p>}
      {Object.entries(bySubject).map(([subject, docs]) => (
        <div key={subject} className="mb-6">
          <h2 className="font-semibold mb-2">
            📁 <span>{subject}</span>
          </h2>
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between bg-white border rounded px-4 py-2 mb-2">
              <span>{doc.title}</span>
              <div className="flex gap-2">
                <Link to={`/documents/${doc.id}`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                  Ouvrir
                </Link>
                <button
                  onClick={() => handleDelete(doc)}
                  className="bg-red-50 text-red-700 px-3 py-1 rounded text-sm"
                >
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
