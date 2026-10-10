import { isDue, type SrsState } from './srs.ts'
import { domainOf, type DomainId, type Flashcard, type Question } from './types.ts'

export const SESSION_SIZE = 10
export const MAX_FLASHCARDS = 4
export const MAX_REVIEWS = 7

export interface SessionEntry {
  kind: 'question' | 'flashcard'
  id: string
  /** Shuffled option ids for questions (ids stay stable; only display order changes). */
  order?: string[]
}

export interface SessionInput {
  questions: Question[]
  flashcards: Flashcard[]
  srs: SrsState
  now: number
  watchedThroughVideo: number
  weights: Record<DomainId, number>
  /** Ids already used this sitting ("keep going" shouldn't repeat them). */
  exclude?: ReadonlySet<string>
  rng?: () => number
  size?: number
}

/**
 * Build a commute session:
 *  1. due flashcards first (most overdue, at most MAX_FLASHCARDS)
 *  2. due questions, up to MAX_REVIEWS reviews in total
 *  3. new questions picked by exam domain weight
 *  4. gaps: more due questions → least-recently-seen questions → new flashcards (cap still applies)
 * Flashcards lead; questions follow in shuffled order.
 */
export function buildSession(input: SessionInput): SessionEntry[] {
  const { srs, now, rng = Math.random, size = SESSION_SIZE } = input
  const exclude = input.exclude ?? new Set<string>()
  const eligible = <T extends { id: string; video: number }>(items: T[]) =>
    items.filter((i) => i.video <= input.watchedThroughVideo && !exclude.has(i.id))
  const qs = eligible(input.questions)
  const fcs = eligible(input.flashcards)
  const byDue = (a: { id: string }, b: { id: string }) => srs[a.id].dueAt - srs[b.id].dueAt

  const flash: Flashcard[] = fcs.filter((f) => isDue(srs[f.id], now)).sort(byDue).slice(0, MAX_FLASHCARDS)
  const dueQs = qs.filter((q) => isDue(srs[q.id], now)).sort(byDue)
  const picked: Question[] = dueQs.splice(0, Math.max(0, MAX_REVIEWS - flash.length))
  const room = () => size - flash.length - picked.length

  // New questions, weighted by domain.
  const unseen = new Map<DomainId, Question[]>()
  for (const q of qs) {
    if (srs[q.id]) continue
    const d = domainOf(q.objective)
    unseen.set(d, [...(unseen.get(d) ?? []), q])
  }
  while (room() > 0 && unseen.size > 0) {
    const domain = weightedPick([...unseen.keys()], (d) => input.weights[d] ?? 1, rng)
    const bucket = unseen.get(domain)!
    picked.push(bucket.splice(Math.floor(rng() * bucket.length), 1)[0])
    if (bucket.length === 0) unseen.delete(domain)
  }

  // Fill any gap.
  picked.push(...dueQs.splice(0, Math.max(0, room())))
  if (room() > 0) {
    const used = new Set(picked.map((q) => q.id))
    const seen = qs
      .filter((q) => srs[q.id] && !used.has(q.id))
      .sort((a, b) => srs[a.id].lastSeenAt - srs[b.id].lastSeenAt)
    picked.push(...seen.slice(0, room()))
  }
  if (room() > 0 && flash.length < MAX_FLASHCARDS) {
    const newCards = fcs.filter((f) => !srs[f.id])
    flash.push(...newCards.slice(0, Math.min(room(), MAX_FLASHCARDS - flash.length)))
  }

  return [
    ...flash.map((f): SessionEntry => ({ kind: 'flashcard', id: f.id })),
    ...shuffle(picked, rng).map(
      (q): SessionEntry => ({ kind: 'question', id: q.id, order: shuffle(q.options.map((o) => o.id), rng) }),
    ),
  ]
}

function weightedPick<T>(items: T[], weight: (t: T) => number, rng: () => number): T {
  const total = items.reduce((s, t) => s + weight(t), 0)
  let r = rng() * total
  for (const t of items) {
    r -= weight(t)
    if (r < 0) return t
  }
  return items[items.length - 1]
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
