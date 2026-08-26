export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
      <span>{message}</span>
      <button onClick={onDismiss} className="text-red-700 font-bold px-2" aria-label="Fermer">
        ×
      </button>
    </div>
  )
}
