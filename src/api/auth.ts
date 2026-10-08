import { apiFetch } from './client'

export type User = { id: string; username: string }
export type LoginResponse = { token: string; user: User }

export function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}
