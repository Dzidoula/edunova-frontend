import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { HomePage } from './HomePage'
import * as AuthContext from '../context/AuthContext'

describe('HomePage', () => {
  it('greets the logged-in user and links to every section', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', username: 'koffi' },
      token: 'jwt',
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Bonjour koffi/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /bibliothèque/i })).toHaveAttribute('href', '/library')
    expect(screen.getByRole('link', { name: /importer/i })).toHaveAttribute('href', '/import')
    expect(screen.getByRole('link', { name: /demander à l'ia/i })).toHaveAttribute('href', '/chat')
    expect(screen.getByRole('link', { name: /m'entraîner/i })).toHaveAttribute('href', '/train')
    expect(screen.getByRole('link', { name: /progression/i })).toHaveAttribute('href', '/progress')
    expect(screen.getByRole('link', { name: /paramètres/i })).toHaveAttribute('href', '/settings')
  })
})
