import { apiFetch } from './client'

export type Settings = { api_key: string; api_base: string; model: string; ocr_engine: string }

export type SettingsUpdatePayload = Omit<Settings, 'api_key'> & { api_key?: string }

export function getSettings(): Promise<Settings> {
  return apiFetch<Settings>('/settings')
}

export function updateSettings(settings: SettingsUpdatePayload): Promise<Settings> {
  return apiFetch<Settings>('/settings', { method: 'PUT', body: JSON.stringify(settings) })
}
