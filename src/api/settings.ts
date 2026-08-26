import { apiFetch } from './client'

export type Settings = { api_key: string; api_base: string; model: string; ocr_engine: string }

export function getSettings(): Promise<Settings> {
  return apiFetch<Settings>('/settings')
}

export function updateSettings(settings: Settings): Promise<Settings> {
  return apiFetch<Settings>('/settings', { method: 'PUT', body: JSON.stringify(settings) })
}
