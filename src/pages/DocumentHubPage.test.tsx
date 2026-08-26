import { render, screen, waitFor } from '@testing-library/react'
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
})
