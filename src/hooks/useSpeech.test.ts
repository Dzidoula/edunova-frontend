import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSpeech } from './useSpeech'

describe('useSpeech', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('reports unavailable when speechSynthesis is absent', () => {
    const original = (window as any).speechSynthesis
    delete (window as any).speechSynthesis
    const { result } = renderHook(() => useSpeech())
    expect(result.current.ttsAvailable).toBe(false)
    ;(window as any).speechSynthesis = original
  })

  it('speaks via window.speechSynthesis when available', () => {
    const speakMock = vi.fn()
    const cancelMock = vi.fn()
    ;(window as any).speechSynthesis = { speak: speakMock, cancel: cancelMock }
    ;(window as any).SpeechSynthesisUtterance = function (this: any, text: string) {
      this.text = text
    }

    const { result } = renderHook(() => useSpeech())
    act(() => result.current.speak('Bonjour'))

    expect(cancelMock).toHaveBeenCalled()
    expect(speakMock).toHaveBeenCalled()
  })
})
