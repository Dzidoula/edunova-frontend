import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { LoginPage } from './LoginPage'
import * as AuthContext from '../context/AuthContext'

describe('LoginPage', () => {
  it('calls login with the typed username', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      login: loginMock,
      logout: vi.fn(),
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByLabelText(/pseudo/i), 'amina')
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /entrer/i }))

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('amina', 'secret123'))
  })

  it('shows an error banner when login fails', async () => {
    const loginMock = vi.fn().mockRejectedValue(new Error('Le pseudo ne peut pas être vide.'))
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      login: loginMock,
      logout: vi.fn(),
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByLabelText(/pseudo/i), 'x')
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /entrer/i }))

    await waitFor(() =>
      expect(screen.getByText('Le pseudo ne peut pas être vide.')).toBeInTheDocument()
    )
  })
})
