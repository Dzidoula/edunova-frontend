import { useEffect, useState } from 'react'
import type { Settings } from '../api/settings'
import { getSettings, updateSettings } from '../api/settings'
import { ErrorBanner } from '../components/ErrorBanner'

const DEFAULT_SETTINGS: Settings = {
  api_key: '',
  api_base: 'https://api.groq.com/openai/v1',
  model: 'llama-3.3-70b-versatile',
  ocr_engine: 'auto',
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible.'))
  }, [])

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setStatus(null)
    setError(null)
    try {
      const saved = await updateSettings(settings)
      setSettings(saved)
      setStatus('✅ Enregistré.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">⚙️ Paramètres</h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="bg-white border rounded p-6 max-w-xl">
        <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
          Clé API (Groq/OpenAI)
        </label>
        <input
          id="apiKey"
          type="password"
          value={settings.api_key}
          onChange={(e) => update('api_key', e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label htmlFor="apiBase" className="block text-sm font-medium mb-1">
          URL de l'API
        </label>
        <input
          id="apiBase"
          value={settings.api_base}
          onChange={(e) => update('api_base', e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label htmlFor="model" className="block text-sm font-medium mb-1">
          Modèle
        </label>
        <input
          id="model"
          value={settings.model}
          onChange={(e) => update('model', e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label htmlFor="ocrEngine" className="block text-sm font-medium mb-1">
          Moteur OCR
        </label>
        <select
          id="ocrEngine"
          value={settings.ocr_engine}
          onChange={(e) => update('ocr_engine', e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="auto">auto</option>
          <option value="tesseract">tesseract</option>
          <option value="easyocr">easyocr</option>
        </select>

        {status && <p className="text-green-700 mb-2">{status}</p>}
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">
          Enregistrer
        </button>
      </div>
    </div>
  )
}
