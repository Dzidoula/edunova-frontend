import { apiFetch } from './client'

export type Memory = {
  id: number
  memory_type: string
  subject: string
  notion: string
  content: string
  weight: number
  created_at: string
}

export function listMemories(): Promise<Memory[]> {
  return apiFetch<Memory[]>('/memory')
}
