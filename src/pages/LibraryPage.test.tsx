import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LibraryPage } from './LibraryPage'
import * as documentsApi from '../api/documents'

const sampleDocs: documentsApi.Document[] = [
  {
    id: 'doc-1',
    title: 'Cours de fractions',
    subject: 'Mathématiques',
    document_type: 'course',
    original_filename: null,
    extracted_text: 'Une fraction représente une division.',
    has_content: true,
    created_at: '2026-08-20T10:00:00',
  },
]

describe('LibraryPage', () => {
  beforeEach(() => {
    vi.spyOn(documentsApi, 'listDocuments').mockResolvedValue(sampleDocs)
    vi.spyOn(documentsApi, 'deleteDocument').mockResolvedValue(undefined)
  })

  it('lists documents grouped by subject', async () => {
    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Cours de fractions')).toBeInTheDocument())
    expect(screen.getByText('Mathématiques')).toBeInTheDocument()
  })

  it('deletes a document when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Cours de fractions')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))

    await waitFor(() => expect(documentsApi.deleteDocument).toHaveBeenCalledWith('doc-1'))
  })
})
