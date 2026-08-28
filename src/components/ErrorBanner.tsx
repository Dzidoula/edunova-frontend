import { AlertTriangle, X } from 'lucide-react'

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-destructive px-4 py-3 rounded-xl mb-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="text-destructive p-1 rounded-full transition-colors duration-200 hover:bg-red-100 cursor-pointer"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
