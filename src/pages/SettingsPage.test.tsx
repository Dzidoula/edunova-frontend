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

  it('does not round-trip the masked api_key when saving an unrelated field', async () => {
    vi.spyOn(settingsApi, 'getSettings').mockResolvedValue({
      api_key: 'sk-...abcd',
      api_base: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile',
      ocr_engine: 'auto',
    })
    const updateMock = vi.spyOn(settingsApi, 'updateSettings').mockResolvedValue({
      api_key: 'sk-...abcd',
      api_base: 'https://api.groq.com/openai/v1',
      model: 'llama-3.1-8b-instant',
      ocr_engine: 'auto',
    })

    render(<SettingsPage />)

    await waitFor(() => expect(screen.getByDisplayValue('llama-3.3-70b-versatile')).toBeInTheDocument())

    // The api_key input should start empty and merely show the masked value as a placeholder.
    const apiKeyInput = screen.getByLabelText(/clé api/i) as HTMLInputElement
    expect(apiKeyInput.value).toBe('')
    expect(apiKeyInput.placeholder).toContain('sk-...abcd')

    await userEvent.clear(screen.getByLabelText(/modèle/i))
    await userEvent.type(screen.getByLabelText(/modèle/i), 'llama-3.1-8b-instant')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => expect(updateMock).toHaveBeenCalled())
    const payload = updateMock.mock.calls[0][0]
    expect(payload).not.toHaveProperty('api_key')
  })

  it('sends the new api_key when the user types one', async () => {
    vi.spyOn(settingsApi, 'getSettings').mockResolvedValue({
      api_key: 'sk-...abcd',
      api_base: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile',
      ocr_engine: 'auto',
    })
    const updateMock = vi.spyOn(settingsApi, 'updateSettings').mockResolvedValue({
      api_key: 'sk-...9999',
      api_base: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile',
      ocr_engine: 'auto',
    })

    render(<SettingsPage />)

    await waitFor(() => expect(screen.getByDisplayValue('llama-3.3-70b-versatile')).toBeInTheDocument())

    await userEvent.type(screen.getByLabelText(/clé api/i), 'gsk_brandnewkey9999')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ api_key: 'gsk_brandnewkey9999' }))
    )
  })
})
