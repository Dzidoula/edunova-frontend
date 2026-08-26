import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { TrainPage } from './TrainPage'
import * as progressApi from '../api/progress'

function makeProgress(overrides: Partial<progressApi.Progress> = {}): progressApi.Progress {
  return {
    notion_name: 'Fractions',
    subject: 'Mathématiques',
    mastery: 'difficulty',
    success: 1,
    failure: 3,
    ...overrides,
  }
}

describe('TrainPage', () => {
  it('renders weak notions returned by listProgress', async () => {
    vi.spyOn(progressApi, 'listProgress').mockResolvedValue([
      makeProgress({ notion_name: 'Fractions', mastery: 'difficulty' }),
      makeProgress({ notion_name: 'Trigonométrie', mastery: 'to_strengthen' }),
      makeProgress({ notion_name: 'Géométrie', mastery: 'mastered' }),
    ])

    render(
      <MemoryRouter>
        <TrainPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Fractions')).toBeInTheDocument())
    expect(screen.getByText('Trigonométrie')).toBeInTheDocument()
    expect(screen.queryByText('Géométrie')).not.toBeInTheDocument()
  })

  it('falls back to default notions when the list is genuinely empty', async () => {
    vi.spyOn(progressApi, 'listProgress').mockResolvedValue([])

    render(
      <MemoryRouter>
        <TrainPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Factorisation')).toBeInTheDocument())
    expect(screen.getByText('Équations')).toBeInTheDocument()
    expect(screen.getByText('Fractions')).toBeInTheDocument()
  })

  it('shows an error banner and no fake default data when the fetch fails', async () => {
    vi.spyOn(progressApi, 'listProgress').mockRejectedValue(new Error('Réseau indisponible.'))

    render(
      <MemoryRouter>
        <TrainPage />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Réseau indisponible.')).toBeInTheDocument())
    expect(screen.queryByText('Factorisation')).not.toBeInTheDocument()
  })
})
