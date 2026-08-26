import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SettingsPage } from './SettingsPage'
import * as settingsApi from '../api/settings'

describe('SettingsPage', () => {
  it('loads existing settings and saves changes', async () => {
    vi.spyOn(settingsApi, 'getSettings').mockResolvedValue({
      api_key: 'sk-...abcd',
      api_base: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile',
      ocr_engine: 'auto',
    })
    const updateMock = vi.spyOn(settingsApi, 'updateSettings').mockResolvedValue({
      api_key: 'sk-...wxyz',
      api_base: 'https://api.groq.com/openai/v1',
      model: 'llama-3.1-8b-instant',
      ocr_engine: 'tesseract',
    })

    render(<SettingsPage />)

    await waitFor(() => expect(screen.getByDisplayValue('llama-3.3-70b-versatile')).toBeInTheDocument())

    await userEvent.clear(screen.getByLabelText(/modèle/i))
    await userEvent.type(screen.getByLabelText(/modèle/i), 'llama-3.1-8b-instant')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ model: 'llama-3.1-8b-instant' }))
    )
  })
})
