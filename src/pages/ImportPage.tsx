import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDocument } from '../api/documents'
import { ErrorBanner } from '../components/ErrorBanner'

const SUBJECTS = ['Mathématiques', 'PCT', 'Algorithmique', 'Français', 'SVT', 'Histoire-Géo', 'Autres documents']
const TYPES: { label: string; value: string }[] = [
  { label: 'Cours / Support', value: 'course' },
  { label: 'Exercices / TD', value: 'exercise' },
  { label: 'Épreuve / Examen', value: 'exam' },
  { label: 'Quiz', value: 'quiz' },
  { label: 'Autre', value: 'other' },
]

export function ImportPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [documentType, setDocumentType] = useState(TYPES[0].value)
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const doc = await createDocument({ title, subject, documentType, textOverride: text || undefined, file })
      navigate(`/documents/${doc.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import impossible.")
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📷 Importer un document</h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <form onSubmit={handleSubmit} className="bg-white border rounded p-6 max-w-xl">
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Titre
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label htmlFor="subject" className="block text-sm font-medium mb-1">
          Matière
        </label>
        <select
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label htmlFor="documentType" className="block text-sm font-medium mb-1">
          Type
        </label>
        <select
          id="documentType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <label htmlFor="file" className="block text-sm font-medium mb-1">
          Fichier (PDF ou image, optionnel)
        </label>
        <input
          id="file"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="w-full mb-4"
        />

        <label htmlFor="text" className="block text-sm font-medium mb-1">
          Ou colle le texte du cours ici
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">
          Importer et afficher
        </button>
      </form>
    </div>
  )
}
