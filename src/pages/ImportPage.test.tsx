import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { ImportPage } from './ImportPage'
import * as documentsApi from '../api/documents'

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

describe('ImportPage', () => {
  it('submits the form and navigates to the new document', async () => {
    vi.spyOn(documentsApi, 'createDocument').mockResolvedValue({
      id: 'doc-9',
      title: 'Cours de fractions',
      subject: 'Mathématiques',
      document_type: 'course',
      original_filename: null,
      extracted_text: 'Une fraction représente une division entre deux nombres.',
      has_content: true,
      created_at: '2026-08-20T10:00:00',
    })

    render(
      <MemoryRouter>
        <ImportPage />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByLabelText(/titre/i), 'Cours de fractions')
    await userEvent.type(
      screen.getByLabelText(/texte/i),
      'Une fraction représente une division entre deux nombres.'
    )
    await userEvent.click(screen.getByRole('button', { name: /importer/i }))

    expect(documentsApi.createDocument).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Cours de fractions' })
    )
    expect(navigateMock).toHaveBeenCalledWith('/documents/doc-9')
  })
})
