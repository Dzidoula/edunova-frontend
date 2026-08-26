import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiFetch, ApiError, setToken } from './client'

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('attaches the bearer token when one is set', async () => {
    setToken('abc123')
    ;(fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hello: 'world' }),
    })

    const result = await apiFetch<{ hello: string }>('/ping')

    expect(result).toEqual({ hello: 'world' })
    const [, init] = (fetch as any).mock.calls[0]
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer abc123')
  })

  it('does not attach a token when none is set', async () => {
    ;(fetch as any).mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    await apiFetch('/ping')
    const [, init] = (fetch as any).mock.calls[0]
    expect((init.headers as Headers).has('Authorization')).toBe(false)
  })

  it('throws ApiError with the backend detail message on failure', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ detail: 'Token invalide.' }),
    })

    await expect(apiFetch('/protected')).rejects.toMatchObject({
      status: 401,
      message: 'Token invalide.',
    })
  })

  it('returns undefined for a 204 response without parsing a body', async () => {
    ;(fetch as any).mockResolvedValue({ ok: true, status: 204 })
    const result = await apiFetch('/documents/123')
    expect(result).toBeUndefined()
  })
})

describe('ApiError', () => {
  it('carries status and message', () => {
    const err = new ApiError(404, 'Document introuvable.')
    expect(err.status).toBe(404)
    expect(err.message).toBe('Document introuvable.')
  })
})
