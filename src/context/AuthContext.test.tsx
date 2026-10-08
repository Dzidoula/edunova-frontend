import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import { getToken } from '../api/client'

function Probe() {
  const { user, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="username">{user?.username ?? 'anonymous'}</span>
      <button onClick={() => login('koffi', 'secret123')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('logs in, stores the token, and exposes the user', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'jwt-123', user: { id: 'u1', username: 'koffi' } }),
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    expect(screen.getByTestId('username').textContent).toBe('anonymous')
    await userEvent.click(screen.getByText('login'))

    await waitFor(() => expect(screen.getByTestId('username').textContent).toBe('koffi'))
    expect(getToken()).toBe('jwt-123')
  })

  it('logs out and clears the token', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'jwt-123', user: { id: 'u1', username: 'koffi' } }),
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    await userEvent.click(screen.getByText('login'))
    await waitFor(() => expect(getToken()).toBe('jwt-123'))

    await userEvent.click(screen.getByText('logout'))
    expect(getToken()).toBeNull()
    expect(screen.getByTestId('username').textContent).toBe('anonymous')
  })
})
