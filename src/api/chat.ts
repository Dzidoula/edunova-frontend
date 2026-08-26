import { apiFetch } from './client'

export type ChatMessage = { role: string; content: string; created_at: string }
export type ChatResponse = { reply: string }

export function sendChatMessage(message: string, documentId?: string): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, document_id: documentId }),
  })
}

export function getChatHistory(documentId?: string): Promise<ChatMessage[]> {
  const query = documentId ? `?document_id=${encodeURIComponent(documentId)}` : ''
  return apiFetch<ChatMessage[]>(`/chat/history${query}`)
}

export function translateText(params: {
  text?: string
  documentId?: string
  targetLang: string
}): Promise<{ translation: string }> {
  return apiFetch('/translate', {
    method: 'POST',
    body: JSON.stringify({ text: params.text, document_id: params.documentId, target_lang: params.targetLang }),
  })
}
