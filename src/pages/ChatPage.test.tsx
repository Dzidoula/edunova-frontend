import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatPage } from './ChatPage'
import * as chatApi from '../api/chat'

describe('ChatPage', () => {
  beforeEach(() => {
    vi.spyOn(chatApi, 'getChatHistory').mockResolvedValue([])
  })

  it('sends a typed message and displays the reply', async () => {
    vi.spyOn(chatApi, 'sendChatMessage').mockResolvedValue({ reply: 'Voici une explication.' })

    render(
      <MemoryRouter initialEntries={['/chat']}>
        <ChatPage />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByPlaceholderText(/pose ta question/i), 'Explique les fractions')
    await userEvent.click(screen.getByRole('button', { name: /envoyer/i }))

    await waitFor(() => expect(screen.getByText('Voici une explication.')).toBeInTheDocument())
    expect(chatApi.sendChatMessage).toHaveBeenCalledWith('Explique les fractions', undefined)
  })

  it('auto-sends a preset prompt from the query string', async () => {
    vi.spyOn(chatApi, 'sendChatMessage').mockResolvedValue({ reply: 'Résumé du document.' })

    render(
      <MemoryRouter initialEntries={['/chat?document_id=doc-1&prompt=R%C3%A9sume%20le%20document']}>
        <ChatPage />
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(chatApi.sendChatMessage).toHaveBeenCalledWith('Résume le document', 'doc-1')
    )
    await waitFor(() => expect(screen.getByText('Résumé du document.')).toBeInTheDocument())
  })

  it('translates the active document when the Traduire button is used', async () => {
    vi.spyOn(chatApi, 'translateText').mockResolvedValue({ translation: 'A fraction represents a division.' })
    vi.spyOn(window, 'prompt').mockReturnValue('anglais')

    render(
      <MemoryRouter initialEntries={['/chat?document_id=doc-1']}>
        <ChatPage />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByRole('button', { name: /traduire/i }))

    await waitFor(() =>
      expect(chatApi.translateText).toHaveBeenCalledWith({ documentId: 'doc-1', targetLang: 'anglais' })
    )
    await waitFor(() =>
      expect(screen.getByText('A fraction represents a division.')).toBeInTheDocument()
    )
  })
})
