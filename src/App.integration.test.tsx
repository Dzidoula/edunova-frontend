import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App'

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('logs in, lands on the dashboard, and can navigate to the library', async () => {
    ;(fetch as any).mockImplementation((url: string) => {
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ token: 'jwt-123', user: { id: 'u1', username: 'amina' } }),
        })
      }
      if (url.includes('/documents')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => [] })
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) })
    })

    render(<App />)

    await userEvent.type(screen.getByLabelText(/pseudo/i), 'amina')
    await userEvent.click(screen.getByRole('button', { name: /entrer/i }))

    await waitFor(() => expect(screen.getByText(/Bonjour amina/)).toBeInTheDocument())

    await userEvent.click(screen.getByRole('link', { name: /bibliothèque/i }))

    await waitFor(() => expect(screen.getByText(/Ma bibliothèque/)).toBeInTheDocument())
  })
})
