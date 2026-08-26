import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { ExercisePage } from './ExercisePage'
import * as progressApi from '../api/progress'

describe('ExercisePage', () => {
  it('walks through 5 steps then records a failure with the returned analysis', async () => {
    vi.spyOn(progressApi, 'recordResult').mockResolvedValue({
      progress: { notion_name: 'Fractions', subject: 'Mathématiques', mastery: 'difficulty', success: 0, failure: 1 },
      analysis: { error_type: 'calculation', summary: 'Erreur de signe.', strategy: 'Vérifier chaque ligne.', source: 'heuristic' },
    })

    render(
      <MemoryRouter initialEntries={['/exercise/Fractions/Math%C3%A9matiques']}>
        <Routes>
          <Route path="/exercise/:notion/:subject" element={<ExercisePage />} />
        </Routes>
      </MemoryRouter>
    )

    for (let i = 0; i < 5; i++) {
      await userEvent.click(screen.getByRole('button', { name: /étape suivante/i }))
    }

    expect(screen.getByText(/terminé/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /à revoir/i }))

    await waitFor(() =>
      expect(progressApi.recordResult).toHaveBeenCalledWith(
        expect.objectContaining({ notion: 'Fractions', subject: 'Mathématiques', success: false })
      )
    )
    await waitFor(() => expect(screen.getByText('Erreur de signe.')).toBeInTheDocument())
  })
})
