import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bot, User, Mic, Square, Globe, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { sendChatMessage, getChatHistory, translateText } from '../api/chat'
import type { ChatMessage } from '../api/chat'
import { useSpeech } from '../hooks/useSpeech'
import { ErrorBanner } from '../components/ErrorBanner'

const MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ children }) => <code className="bg-black/5 rounded px-1 py-0.5 text-xs">{children}</code>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="underline">
      {children}
    </a>
  ),
}

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const documentId = searchParams.get('document_id') || undefined
  const presetPrompt = searchParams.get('prompt') || undefined

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { speak, stop, listen, ttsAvailable, sttAvailable } = useSpeech()
  const autoSent = useRef(false)

  useEffect(() => {
    // Load the history first, then auto-send the preset prompt, so the history response
    // can never overwrite the optimistic message. `cancelled` drops stale responses when
    // the document changes (or on StrictMode's double mount).
    let cancelled = false
    setMessages([])
    getChatHistory(documentId)
      .then((history) => {
        if (!cancelled) setMessages(history)
      })
      .catch(() => {
        if (!cancelled) setMessages([])
      })
      .finally(() => {
        if (cancelled || !presetPrompt || autoSent.current) return
        autoSent.current = true
        // Drop ?prompt= so a page refresh doesn't re-send it.
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev)
            next.delete('prompt')
            return next
          },
          { replace: true }
        )
        void send(presetPrompt)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

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
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-4 text-foreground">
        <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
        Demander à l'IA
      </h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="bg-white border border-border rounded-2xl p-4 mb-4 h-96 overflow-y-auto flex flex-col gap-3">
        {messages.map((m, i) => {
          const isTutor = m.role === 'tutor'
          return (
            <div key={i} className={`flex items-start gap-2 ${isTutor ? '' : 'flex-row-reverse'}`}>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isTutor ? 'bg-primary text-on-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {isTutor ? <Bot className="h-4 w-4" aria-hidden="true" /> : <User className="h-4 w-4" aria-hidden="true" />}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isTutor ? 'bg-muted text-foreground rounded-tl-none' : 'bg-primary text-on-primary rounded-tr-none'
                }`}
              >
                {isTutor ? (
                  <ReactMarkdown components={MARKDOWN_COMPONENTS}>{m.content}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pose ta question…"
          className="flex-1 border border-border rounded-lg px-3 py-2 transition-colors duration-200 focus:border-primary"
        />
        {sttAvailable && (
          <button
            onClick={handleVoiceInput}
            className="bg-muted text-foreground px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-border cursor-pointer"
            aria-label="Micro"
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {ttsAvailable && (
          <button
            onClick={stop}
            className="bg-red-50 text-destructive px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-red-100 cursor-pointer"
            aria-label="Stop"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          onClick={handleTranslate}
          className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-border cursor-pointer"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          Traduire
        </button>
        <button
          onClick={handleSend}
          className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold transition-colors duration-200 hover:bg-primary-dark cursor-pointer"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Envoyer
        </button>
      </div>
    </div>
  )
}
