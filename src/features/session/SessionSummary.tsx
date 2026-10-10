import { ActionBar } from '../../components/ActionBar.tsx'
import { Button } from '../../components/Button.tsx'
import { ObjectiveChip } from '../../components/ObjectiveChip.tsx'
import { flashcardById, questionById } from '../../lib/content.ts'
import type { SessionEntry } from '../../lib/session.ts'
import type { Result } from './SessionPage.tsx'

interface Props {
  entries: SessionEntry[]
  results: Record<number, Result>
  onKeepGoing: () => void
  onDone: () => void
}

export function SessionSummary({ entries, results, onKeepGoing, onDone }: Props) {
  const scored = entries.map((e, i) => ({ entry: e, result: results[i] })).filter((x) => x.result)
  const right = scored.filter((x) => x.result.correct).length
  const missed = scored.filter((x) => !x.result.correct)

  return (
    <div className="pt-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">Session done</p>
      <p className="mt-1 mb-6 text-4xl font-bold">
        {right}/{scored.length}
      </p>

      {missed.length > 0 ? (
        <>
          <h2 className="mb-2 font-semibold">Missed. These come back tomorrow:</h2>
          <ul className="mb-6 flex flex-col gap-2">
            {missed.map(({ entry }) => {
              const item = entry.kind === 'question' ? questionById.get(entry.id) : flashcardById.get(entry.id)
              const text = item && ('stem' in item ? item.stem : item.front)
              return (
                <li key={entry.id} className="rounded-xl border border-line bg-surface p-3">
                  <ObjectiveChip objective={item?.objective ?? null} />
                  <p className="mt-1 line-clamp-2 text-sm">{text}</p>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <p className="mb-6 text-good">Clean sweep. Nothing missed.</p>
      )}

      <ActionBar>
        <Button variant="secondary" className="flex-1" onClick={onDone}>
          Done
        </Button>
        <Button className="flex-1" onClick={onKeepGoing}>
          Keep going
        </Button>
      </ActionBar>
    </div>
  )
}
