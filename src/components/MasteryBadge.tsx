import type { Mastery } from '../api/progress'

const LABELS: Record<Mastery, string> = {
  mastered: '🟢 Maîtrisé',
  to_strengthen: '🟡 À renforcer',
  difficulty: '🔴 Difficulté',
  unknown: '⚪ Non évalué',
}

export function MasteryBadge({ mastery }: { mastery: Mastery }) {
  return <span>{LABELS[mastery]}</span>
}
