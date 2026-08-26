import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sendChatMessage, getChatHistory, translateText } from '../api/chat'
import type { ChatMessage } from '../api/chat'
import { useSpeech } from '../hooks/useSpeech'
import { ErrorBanner } from '../components/ErrorBanner'

export function ChatPage() {
  const [searchParams] = useSearchParams()
  const documentId = searchParams.get('document_id') || undefined
  const presetPrompt = searchParams.get('prompt') || undefined

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { speak, stop, listen, ttsAvailable, sttAvailable } = useSpeech()
  const autoSent = useRef(false)

  useEffect(() => {
    getChatHistory(documentId).then(setMessages).catch(() => setMessages([]))
  }, [documentId])

  useEffect(() => {
    if (presetPrompt && !autoSent.current) {
      autoSent.current = true
      void send(presetPrompt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetPrompt])

  async function send(message: string) {
    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: message, created_at: new Date().toISOString() }])
    try {
      const { reply } = await sendChatMessage(message, documentId)
      setMessages((prev) => [...prev, { role: 'tutor', content: reply, created_at: new Date().toISOString() }])
      if (ttsAvailable) speak(reply)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.')
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    setInput('')
    await send(text)
  }

  function handleVoiceInput() {
    listen((text) => setInput(text))
  }

  async function handleTranslate() {
    const targetLang = window.prompt('Vers quelle langue ? (ex: anglais, espagnol)', 'anglais')
    if (!targetLang) return
    setError(null)
    const label = documentId ? 'Traduire le document en ' + targetLang : 'Traduire en ' + targetLang
    setMessages((prev) => [...prev, { role: 'user', content: label, created_at: new Date().toISOString() }])
    try {
      const { translation } = await translateText({ documentId, targetLang })
      setMessages((prev) => [...prev, { role: 'tutor', content: translation, created_at: new Date().toISOString() }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Traduction impossible.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🤖 Demander à l'IA</h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="bg-white border rounded p-4 mb-4 h-96 overflow-y-auto">
        {messages.map((m, i) => (
          <p key={i} className={m.role === 'tutor' ? 'text-blue-700 mb-2' : 'text-slate-800 mb-2'}>
            <strong>{m.role === 'tutor' ? '🤖 Tuteur : ' : '👤 Toi : '}</strong>
            {m.content}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pose ta question…"
          className="flex-1 border rounded px-3 py-2"
        />
        {sttAvailable && (
          <button onClick={handleVoiceInput} className="bg-slate-100 px-3 py-2 rounded" aria-label="Micro">
            🎤
          </button>
        )}
        {ttsAvailable && (
          <button onClick={stop} className="bg-red-50 text-red-700 px-3 py-2 rounded" aria-label="Stop">
            ⏹
          </button>
        )}
        <button onClick={handleTranslate} className="bg-slate-100 px-3 py-2 rounded">
          🌐 Traduire
        </button>
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">
          Envoyer
        </button>
      </div>
    </div>
  )
}
