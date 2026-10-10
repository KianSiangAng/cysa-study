import { objectiveName } from '../lib/content.ts'

export function ObjectiveChip({ objective }: { objective: string | null }) {
  if (!objective) return <span className="text-xs text-muted">—</span>
  return (
    <span
      title={objectiveName.get(objective)}
      className="inline-block rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted"
    >
      {objective}
    </span>
  )
}
