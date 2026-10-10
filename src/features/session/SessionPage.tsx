import { useEffect, useState } from 'react'
import { Button } from '../../components/Button.tsx'
import { flashcardById, flashcards, progress, questionById, questions, weights } from '../../lib/content.ts'
import { navigate } from '../../lib/router.ts'
import { buildSession, type SessionEntry } from '../../lib/session.ts'
import type { SrsState } from '../../lib/srs.ts'
import { KEYS, load, remove, save } from '../../lib/storage.ts'
import { FlashcardCard } from './FlashcardCard.tsx'
import { isCorrect, QuestionCard } from './QuestionCard.tsx'
import { SessionSummary } from './SessionSummary.tsx'

export interface Result {
  correct: boolean
  chosen?: string[]
}

interface SessionState {
  entries: SessionEntry[]
  index: number
  results: Record<number, Result>
  /** Every id shown this sitting, so "keep going" doesn't repeat them. */
  used: string[]
}

interface Props {
  srs: SrsState
  record: (id: string, correct: boolean) => void
}

function newSession(srs: SrsState, used: string[] = []): SessionState {
  const entries = buildSession({
    questions,
    flashcards,
    srs,
    now: Date.now(),
    watchedThroughVideo: progress.watchedThroughVideo,
    weights,
    exclude: new Set(used),
  })
  return { entries, index: 0, results: {}, used: [...used, ...entries.map((e) => e.id)] }
}

/** Resume a session saved in sessionStorage (e.g. after the phone locked), if it still matches the content. */
function restore(): SessionState | null {
  const saved = load<SessionState | null>(KEYS.session, null, 'session')
  if (!saved?.entries?.length) return null
  const exists = (e: SessionEntry) => (e.kind === 'question' ? questionById.has(e.id) : flashcardById.has(e.id))
  return saved.entries.every(exists) ? saved : null
}

export function SessionPage({ srs, record }: Props) {
  const [state, setState] = useState<SessionState>(() => restore() ?? newSession(srs))
  const { entries, index, results } = state

  useEffect(() => save(KEYS.session, state, 'session'), [state])
  useEffect(() => window.scrollTo(0, 0), [index])

  const answer = (result: Result) => {
    record(entries[index].id, result.correct)
    setState((s) => ({ ...s, results: { ...s.results, [s.index]: result } }))
  }
  const next = () => setState((s) => ({ ...s, index: s.index + 1 }))
  const exit = () => {
    remove(KEYS.session, 'session')
    navigate('/')
  }

  if (entries.length === 0) {
    return (
      <div className="pt-8 text-center">
        <p className="mb-6 text-lg">Nothing left to study right now.</p>
        <Button onClick={exit}>Back home</Button>
      </div>
    )
  }

  if (index >= entries.length) {
    return (
      <SessionSummary
        entries={entries}
        results={results}
        onKeepGoing={() => setState((s) => newSession(srs, s.used))}
        onDone={exit}
      />
    )
  }

  const entry = entries[index]
  const done = Object.keys(results).length
  return (
    <div>
      <header className="mb-5 flex items-center gap-3">
        <button type="button" onClick={exit} aria-label="End session" className="-ml-2 min-h-12 min-w-12 text-2xl text-muted">
          ×
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-accent transition-all" style={{ width: `${(done / entries.length) * 100}%` }} />
        </div>
        <span className="min-w-12 text-right font-mono text-sm text-muted">
          {index + 1}/{entries.length}
        </span>
      </header>

      {entry.kind === 'flashcard' ? (
        <FlashcardCard
          key={index}
          card={flashcardById.get(entry.id)!}
          onGrade={(gotIt) => {
            answer({ correct: gotIt })
            next()
          }}
        />
      ) : (
        <QuestionCard
          key={index}
          question={questionById.get(entry.id)!}
          order={entry.order ?? questionById.get(entry.id)!.options.map((o) => o.id)}
          chosen={results[index]?.chosen ?? null}
          onAnswer={(chosen) => answer({ correct: isCorrect(questionById.get(entry.id)!, chosen), chosen })}
          onNext={next}
          isLast={index === entries.length - 1}
        />
      )}
    </div>
  )
}
