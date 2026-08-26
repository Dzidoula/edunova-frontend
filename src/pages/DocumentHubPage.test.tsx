import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { DocumentHubPage } from './DocumentHubPage'
import * as documentsApi from '../api/documents'

const sampleDoc: documentsApi.Document = {
  id: 'doc-1',
  title: 'Cours de fractions',
  subject: 'Mathématiques',
  document_type: 'course',
  original_filename: null,
  extracted_text: 'Une fraction représente une division entre deux nombres.',
  has_content: true,
  created_at: '2026-08-20T10:00:00',
}

describe('DocumentHubPage', () => {
  it('loads and displays the document content and action list', async () => {
    vi.spyOn(documentsApi, 'getDocument').mockResolvedValue(sampleDoc)

    render(
      <MemoryRouter initialEntries={['/documents/doc-1']}>
        <Routes>
          <Route path="/documents/:id" element={<DocumentHubPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Cours de fractions')).toBeInTheDocument())
    expect(screen.getByText(/Une fraction représente/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /résume le document/i })).toHaveAttribute(
      'href',
      expect.stringContaining('document_id=doc-1')
    )
  })

  it('edits the document text and displays the updated content', async () => {
    vi.spyOn(documentsApi, 'getDocument').mockResolvedValue(sampleDoc)
    const updateMock = vi.spyOn(documentsApi, 'updateDocumentText').mockResolvedValue({
      ...sampleDoc,
      extracted_text: 'Texte corrigé manuellement.',
    })

    render(
      <MemoryRouter initialEntries={['/documents/doc-1']}>
        <Routes>
          <Route path="/documents/:id" element={<DocumentHubPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Cours de fractions')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /modifier le texte/i }))
    const textarea = screen.getByLabelText(/texte du document/i)
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Texte corrigé manuellement.')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer le texte/i }))

    await waitFor(() => expect(updateMock).toHaveBeenCalledWith('doc-1', 'Texte corrigé manuellement.'))
    await waitFor(() => expect(screen.getByText('Texte corrigé manuellement.')).toBeInTheDocument())
  })

  it('reruns OCR and displays the updated content', async () => {
    const noContentDoc: documentsApi.Document = {
      ...sampleDoc,
      extracted_text: '',
      has_content: false,
    }
    vi.spyOn(documentsApi, 'getDocument').mockResolvedValue(noContentDoc)
    const rerunMock = vi.spyOn(documentsApi, 'rerunOcr').mockResolvedValue({
      ...sampleDoc,
      extracted_text: 'Texte extrait par OCR.',
      has_content: true,
    })

    render(
      <MemoryRouter initialEntries={['/documents/doc-1']}>
        <Routes>
          <Route path="/documents/:id" element={<DocumentHubPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Cours de fractions')).toBeInTheDocument())
    expect(screen.getByText(/aucun texte extractible/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /relancer l'ocr/i }))

    await waitFor(() => expect(rerunMock).toHaveBeenCalledWith('doc-1'))
    await waitFor(() => expect(screen.getByText('Texte extrait par OCR.')).toBeInTheDocument())
  })
})
