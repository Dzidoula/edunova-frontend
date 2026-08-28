import { useEffect, useState } from 'react'
import type { Settings } from '../api/settings'
import { getSettings, updateSettings } from '../api/settings'
import { ErrorBanner } from '../components/ErrorBanner'
import { Settings as SettingsIcon, CheckCircle2 } from 'lucide-react'

const DEFAULT_SETTINGS: Settings = {
  api_key: '',
  api_base: 'https://api.groq.com/openai/v1',
  model: 'openai/gpt-oss-120b',
  ocr_engine: 'auto',
}

const inputClass =
  'w-full border border-border rounded-lg px-3 py-2 mb-4 transition-colors duration-200 focus:border-primary'

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  // The api_key field is held separately and starts empty: `settings.api_key` only ever
  // holds the MASKED value returned by the server, and must never be sent back as-is.
  const [apiKeyInput, setApiKeyInput] = useState('')
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
      const trimmedKey = apiKeyInput.trim()
      const payload = {
        api_base: settings.api_base,
        model: settings.model,
        ocr_engine: settings.ocr_engine,
        ...(trimmedKey ? { api_key: trimmedKey } : {}),
      }
      const saved = await updateSettings(payload)
      setSettings(saved)
      setApiKeyInput('')
      setStatus('Enregistré.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.')
    }
  }

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-4 text-foreground">
        <SettingsIcon className="h-6 w-6 text-primary" aria-hidden="true" />
        Paramètres
      </h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="bg-white border border-border rounded-2xl p-6 max-w-xl">
        <label htmlFor="apiKey" className="block text-sm font-medium mb-1 text-foreground">
          Clé API (Groq/OpenAI)
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder={
            settings.api_key
              ? `Clé actuelle : ${settings.api_key} — laisse vide pour ne pas changer`
              : 'Aucune clé enregistrée'
          }
          className={inputClass}
        />

        <label htmlFor="apiBase" className="block text-sm font-medium mb-1 text-foreground">
          URL de l'API
        </label>
        <input
          id="apiBase"
          value={settings.api_base}
          onChange={(e) => update('api_base', e.target.value)}
          className={inputClass}
        />

        <label htmlFor="model" className="block text-sm font-medium mb-1 text-foreground">
          Modèle
        </label>
        <input
          id="model"
          value={settings.model}
          onChange={(e) => update('model', e.target.value)}
          className={inputClass}
        />

        <label htmlFor="ocrEngine" className="block text-sm font-medium mb-1 text-foreground">
          Moteur OCR
        </label>
        <select
          id="ocrEngine"
          value={settings.ocr_engine}
          onChange={(e) => update('ocr_engine', e.target.value)}
          className={inputClass}
        >
          <option value="auto">auto</option>
          <option value="tesseract">tesseract</option>
          <option value="easyocr">easyocr</option>
        </select>

        {status && (
          <p className="flex items-center gap-1.5 text-success mb-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {status}
          </p>
        )}
        <button
          onClick={handleSave}
          className="bg-primary text-on-primary px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 hover:bg-primary-dark cursor-pointer"
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}
