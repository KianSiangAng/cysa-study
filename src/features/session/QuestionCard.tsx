import { useState } from 'react'
import { ActionBar } from '../../components/ActionBar.tsx'
import { Button } from '../../components/Button.tsx'
import { ObjectiveChip } from '../../components/ObjectiveChip.tsx'
import type { Question } from '../../lib/types.ts'

interface Props {
  question: Question
  order: string[]
  /** Option ids chosen, once answered (restored after a reload). */
  chosen: string[] | null
  onAnswer: (chosen: string[]) => void
  onNext: () => void
  isLast: boolean
}

export function isCorrect(question: Question, chosen: string[]): boolean {
  return chosen.length === question.correct.length && chosen.every((c) => question.correct.includes(c))
}

export function QuestionCard({ question, order, chosen, onAnswer, onNext, isLast }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const needed = question.correct.length
  const multi = needed > 1
  const answered = chosen !== null
  const options = order.map((id) => question.options.find((o) => o.id === id)!).filter(Boolean)
  const letter = (id: string) => String.fromCharCode(65 + order.indexOf(id))

  const tap = (id: string) => {
    if (answered) return
    if (!multi) return onAnswer([id])
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < needed ? [...s, id] : s))
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm text-muted">
        <ObjectiveChip objective={question.objective} />
        {question.type === 'scenario' && <span>Scenario</span>}
        {multi && <span>Choose {needed}</span>}
      </div>
      <p className="mb-4 text-lg font-medium leading-snug">{question.stem}</p>
      {question.artifact && (
        <pre className="mb-4 overflow-x-auto rounded-xl border border-line bg-surface p-3 font-mono text-[13px] leading-relaxed">
          {question.artifact}
        </pre>
      )}

      {answered && <ResultBanner correct={isCorrect(question, chosen)} answer={question.correct.map(letter).sort().join(', ')} />}

      <ul className="flex flex-col gap-3">
        {options.map((o) => {
          const isRight = question.correct.includes(o.id)
          const picked = answered ? chosen.includes(o.id) : selected.includes(o.id)
          const tone = !answered
            ? picked
              ? 'border-accent bg-surface-2'
              : 'border-line bg-surface'
            : isRight
              ? 'border-good bg-good-bg'
              : picked
                ? 'border-bad bg-bad-bg'
                : 'border-line bg-surface opacity-80'
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => tap(o.id)}
                aria-pressed={picked}
                disabled={answered}
                className={`flex min-h-14 w-full gap-3 rounded-xl border-2 p-3 text-left disabled:cursor-default ${tone}`}
              >
                <span className="font-mono font-bold text-muted">{letter(o.id)}</span>
                <span className="flex-1">
                  <span className="block">{o.text}</span>
                  {answered && (
                    <span className="mt-1.5 block text-sm text-muted">
                      {isRight ? '✓ ' : picked ? '✗ ' : ''}
                      {o.why}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {answered && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4">
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Explanation</h3>
          <p>{question.explanation}</p>
        </div>
      )}

      <ActionBar>
        {answered ? (
          <Button className="flex-1" onClick={onNext}>
            {isLast ? 'See results' : 'Next'}
          </Button>
        ) : multi ? (
          <Button className="flex-1" disabled={selected.length !== needed} onClick={() => onAnswer(selected)}>
            Check ({selected.length}/{needed})
          </Button>
        ) : (
          <p className="flex min-h-12 flex-1 items-center justify-center text-muted">Tap an answer</p>
        )}
      </ActionBar>
    </div>
  )
}

function ResultBanner({ correct, answer }: { correct: boolean; answer: string }) {
  return (
    <div
      role="status"
      className={`mb-3 rounded-xl px-4 py-3 font-semibold ${correct ? 'bg-good-bg text-good' : 'bg-bad-bg text-bad'}`}
    >
      {correct ? '✓ Correct' : `✗ Not quite. Answer: ${answer}`}
    </div>
  )
}
