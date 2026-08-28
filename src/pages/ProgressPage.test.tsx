import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { ProgressPage } from './ProgressPage'
import * as progressApi from '../api/progress'
import * as memoryApi from '../api/memory'

describe('ProgressPage', () => {
  it('shows notions with their mastery badge and recent memories', async () => {
    vi.spyOn(progressApi, 'listProgress').mockResolvedValue([
      { notion_name: 'Fractions', subject: 'Mathématiques', mastery: 'difficulty', success: 1, failure: 3 },
    ])
    vi.spyOn(memoryApi, 'listMemories').mockResolvedValue([
      {
        id: 1,
        memory_type: 'error',
        subject: 'Mathématiques',
        notion: 'Fractions',
        content: 'Analyse d\'erreur sur les fractions.',
        weight: 2,
        created_at: '2026-08-20T10:00:00',
      },
    ])

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Fractions')).toBeInTheDocument())
    expect(screen.getByText('Difficulté')).toBeInTheDocument()
    expect(screen.getByText(/Analyse d'erreur sur les fractions/)).toBeInTheDocument()
  })
})
