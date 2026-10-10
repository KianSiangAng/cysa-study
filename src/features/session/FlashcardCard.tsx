import { useState } from 'react'
import { ActionBar } from '../../components/ActionBar.tsx'
import { Button } from '../../components/Button.tsx'
import { ObjectiveChip } from '../../components/ObjectiveChip.tsx'
import type { Flashcard } from '../../lib/types.ts'

interface Props {
  card: Flashcard
  onGrade: (gotIt: boolean) => void
}

export function FlashcardCard({ card, onGrade }: Props) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm text-muted">
        <ObjectiveChip objective={card.objective} />
        <span>Flashcard</span>
      </div>
      <button
        type="button"
        onClick={() => setFlipped(true)}
        disabled={flipped}
        className="flex min-h-56 w-full flex-col justify-center rounded-2xl border-2 border-line bg-surface p-5 text-left disabled:cursor-default"
      >
        <span className="text-xl font-semibold leading-snug">{card.front}</span>
        {flipped ? (
          <span className="mt-4 block border-t border-line pt-4 text-base whitespace-pre-line">{card.back}</span>
        ) : (
          <span className="mt-4 text-sm text-muted">Tap to reveal</span>
        )}
      </button>
      <ActionBar>
        {flipped ? (
          <>
            <Button variant="secondary" className="flex-1" onClick={() => onGrade(false)}>
              Missed
            </Button>
            <Button className="flex-1" onClick={() => onGrade(true)}>
              Got it
            </Button>
          </>
        ) : (
          <Button className="flex-1" onClick={() => setFlipped(true)}>
            Show answer
          </Button>
        )}
      </ActionBar>
    </div>
  )
}
