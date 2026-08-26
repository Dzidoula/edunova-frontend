import { apiFetch } from './client'

export type Mastery = 'mastered' | 'to_strengthen' | 'difficulty' | 'unknown'
export type Progress = { notion_name: string; subject: string; mastery: Mastery; success: number; failure: number }
export type ErrorAnalysis = { error_type: string; summary: string; strategy: string; source: string }
export type ProgressResult = { progress: Progress; analysis: ErrorAnalysis | null }

export function listProgress(): Promise<Progress[]> {
  return apiFetch<Progress[]>('/progress')
}

export function recordResult(params: {
  notion: string
  subject: string
  success: boolean
  learnerNote?: string
}): Promise<ProgressResult> {
  return apiFetch<ProgressResult>('/progress/result', {
    method: 'POST',
    body: JSON.stringify({
      notion: params.notion,
      subject: params.subject,
      success: params.success,
      learner_note: params.learnerNote || '',
    }),
  })
}
