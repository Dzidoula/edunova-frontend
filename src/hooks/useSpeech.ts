import { useCallback } from 'react'

type SpeechRecognitionResultHandler = (text: string) => void

export function useSpeech() {
  const ttsAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window
  const sttAvailable =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const speak = useCallback(
    (text: string) => {
      if (!ttsAvailable) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fr-FR'
      window.speechSynthesis.speak(utterance)
    },
    [ttsAvailable]
  )

  const stop = useCallback(() => {
    if (ttsAvailable) window.speechSynthesis.cancel()
  }, [ttsAvailable])

  const listen = useCallback(
    (onResult: SpeechRecognitionResultHandler) => {
      const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!Recognition) return
      const recognition = new Recognition()
      recognition.lang = 'fr-FR'
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript
        onResult(text)
      }
      recognition.start()
    },
    []
  )

  return { speak, stop, listen, ttsAvailable, sttAvailable }
}
