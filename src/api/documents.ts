import { apiFetch } from './client'

export type Document = {
  id: string
  title: string
  subject: string
  document_type: string
  original_filename: string | null
  extracted_text: string
  has_content: boolean
  created_at: string
}

export function listDocuments(): Promise<Document[]> {
  return apiFetch<Document[]>('/documents')
}

export function getDocument(id: string): Promise<Document> {
  return apiFetch<Document>(`/documents/${id}`)
}

export function createDocument(params: {
  title: string
  subject: string
  documentType: string
  textOverride?: string
  file?: File
}): Promise<Document> {
  const form = new FormData()
  form.set('title', params.title)
  form.set('subject', params.subject)
  form.set('document_type', params.documentType)
  if (params.textOverride) form.set('text_override', params.textOverride)
  if (params.file) form.set('file', params.file)
  return apiFetch<Document>('/documents', { method: 'POST', body: form })
}

export function updateDocumentText(id: string, text: string): Promise<Document> {
  return apiFetch<Document>(`/documents/${id}/text`, {
    method: 'PUT',
    body: JSON.stringify({ text }),
  })
}

export function rerunOcr(id: string): Promise<Document> {
  return apiFetch<Document>(`/documents/${id}/ocr`, { method: 'POST' })
}

export function deleteDocument(id: string): Promise<void> {
  return apiFetch<void>(`/documents/${id}`, { method: 'DELETE' })
}
