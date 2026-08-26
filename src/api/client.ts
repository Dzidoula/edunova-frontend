const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TOKEN_KEY = 'edunova_token'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = await response.json()
      if (body?.detail) message = body.detail
    } catch {
      // no JSON body — keep statusText
    }
    if (response.status === 401) {
      // The stored token is expired/invalid: drop it so ProtectedRoute redirects to /login
      // on next render instead of leaving the user stuck on a broken authenticated page.
      setToken(null)
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
