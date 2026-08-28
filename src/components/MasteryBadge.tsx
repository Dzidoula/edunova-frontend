import { CheckCircle2, AlertCircle, XCircle, Circle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Mastery } from '../api/progress'

const CONFIG: Record<Mastery, { label: string; icon: LucideIcon; classes: string }> = {
  mastered: { label: 'Maîtrisé', icon: CheckCircle2, classes: 'bg-green-50 text-success' },
  to_strengthen: { label: 'À renforcer', icon: AlertCircle, classes: 'bg-amber-50 text-warning' },
  difficulty: { label: 'Difficulté', icon: XCircle, classes: 'bg-red-50 text-destructive' },
  unknown: { label: 'Non évalué', icon: Circle, classes: 'bg-muted text-muted-foreground' },
}

export function MasteryBadge({ mastery }: { mastery: Mastery }) {
  const { label, icon: Icon, classes } = CONFIG[mastery]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${classes}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  )
}
