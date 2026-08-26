import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'
import * as AuthContext from '../context/AuthContext'

function renderWithAuth(token: string | null) {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: token ? { id: 'u1', username: 'koffi' } : null,
    token,
    login: vi.fn(),
    logout: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/login" element={<div>Login screen</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<div>Home screen</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('renders the protected content when authenticated', () => {
    renderWithAuth('jwt-123')
    expect(screen.getByText('Home screen')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithAuth(null)
    expect(screen.getByText('Login screen')).toBeInTheDocument()
    expect(screen.queryByText('Home screen')).not.toBeInTheDocument()
  })
})
