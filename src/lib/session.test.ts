import { describe, expect, it } from 'vitest'
import { buildSession, MAX_FLASHCARDS, SESSION_SIZE } from './session.ts'
import type { SrsEntry, SrsState } from './srs.ts'
import type { Flashcard, Question } from './types.ts'

const NOW = new Date(2026, 9, 10, 8, 0).getTime()
const DAY = 86_400_000
const WEIGHTS = { '1': 34, '2': 26, '3': 24, '4': 16 } as const

let seed = 1
const rng = () => {
  // Deterministic LCG so tests are repeatable.
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const question = (objective: string, n: number, video = 10): Question => ({
  id: `${objective}-${String(n).padStart(3, '0')}`,
  examVersion: 'CS0-004',
  objective,
  type: 'mcq',
  difficulty: 2,
  stem: 's',
  artifact: null,
  options: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: id, why: id })),
  correct: ['a'],
  explanation: 'e',
  tags: [],
  review: false,
  video,
})
const card = (objective: string, n: number, video = 10): Flashcard => ({
  id: `fc-${objective}-${String(n).padStart(3, '0')}`,
  examVersion: 'CS0-004',
  objective,
  front: 'f',
  back: 'b',
  tags: [],
  video,
})
const due = (daysAgo: number): SrsEntry => ({ box: 1, dueAt: NOW - daysAgo * DAY, seen: 1, correct: 0, lastSeenAt: 0 })
const later = (lastSeenAt = 0): SrsEntry => ({ box: 3, dueAt: NOW + 5 * DAY, seen: 1, correct: 1, lastSeenAt })

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1)
const base = { now: NOW, watchedThroughVideo: 24, weights: WEIGHTS, rng }

describe('buildSession', () => {
  it('caps flashcards at 4 and puts them first, most overdue first', () => {
    const flashcards = range(8).map((n) => card('1.1', n))
    const questions = range(20).map((n) => question('1.1', n))
    const srs: SrsState = Object.fromEntries(flashcards.map((f, i) => [f.id, due(i + 1)]))
    const s = buildSession({ ...base, questions, flashcards, srs })
    expect(s).toHaveLength(SESSION_SIZE)
    expect(s.filter((e) => e.kind === 'flashcard')).toHaveLength(MAX_FLASHCARDS)
    expect(s.slice(0, 4).every((e) => e.kind === 'flashcard')).toBe(true)
    expect(s.slice(0, 4).map((e) => e.id)).toEqual(['fc-1.1-008', 'fc-1.1-007', 'fc-1.1-006', 'fc-1.1-005'])
  })

  it('never exceeds 4 flashcards even when questions run out', () => {
    const flashcards = range(10).map((n) => card('2.4', n))
    const s = buildSession({ ...base, questions: [question('2.4', 1)], flashcards, srs: {} })
    expect(s.filter((e) => e.kind === 'flashcard')).toHaveLength(MAX_FLASHCARDS)
    expect(s).toHaveLength(5)
  })

  it('excludes anything past watchedThroughVideo', () => {
    const questions = [question('1.1', 1, 20), question('1.1', 2, 25)]
    const flashcards = [card('1.1', 1, 30)]
    const s = buildSession({ ...base, questions, flashcards, srs: {} })
    expect(s.map((e) => e.id)).toEqual(['1.1-001'])
  })

  it('takes due reviews before new items, up to 7 reviews in total', () => {
    const questions = range(20).map((n) => question('1.1', n))
    const flashcards = range(2).map((n) => card('1.1', n))
    const srs: SrsState = Object.fromEntries([
      ...questions.slice(0, 12).map((q) => [q.id, due(1)] as const),
      ...flashcards.map((f) => [f.id, due(1)] as const),
    ])
    const s = buildSession({ ...base, questions, flashcards, srs })
    const qIds = s.filter((e) => e.kind === 'question').map((e) => e.id)
    const reviews = qIds.filter((id) => srs[id])
    expect(s.filter((e) => e.kind === 'flashcard')).toHaveLength(2)
    expect(reviews).toHaveLength(5) // 7 reviews − 2 flashcards
    expect(qIds).toHaveLength(8) // 5 reviews + 3 new
  })

  it('fills gaps with more due questions, then least-recently-seen ones', () => {
    const questions = range(12).map((n) => question('1.1', n))
    const srs: SrsState = Object.fromEntries(
      questions.map((q, i) => [q.id, i < 8 ? due(1) : later(i)] as const),
    )
    const s = buildSession({ ...base, questions, flashcards: [], srs })
    const ids = s.map((e) => e.id)
    expect(ids).toHaveLength(10)
    for (const q of questions.slice(0, 8)) expect(ids).toContain(q.id) // all 8 due
    expect(ids).toContain('1.1-009') // seen longest ago
    expect(ids).toContain('1.1-010')
    expect(ids).not.toContain('1.1-012')
  })

  it('respects the exclude set for "keep going"', () => {
    const questions = range(12).map((n) => question('1.1', n))
    const first = buildSession({ ...base, questions, flashcards: [], srs: {} })
    const second = buildSession({ ...base, questions, flashcards: [], srs: {}, exclude: new Set(first.map((e) => e.id)) })
    expect(second).toHaveLength(2)
    expect(second.some((e) => first.some((f) => f.id === e.id))).toBe(false)
  })

  it('weights new questions by exam domain weight', () => {
    const questions = ['1.1', '2.4', '3.2', '4.2'].flatMap((o) => range(200).map((n) => question(o, n)))
    const counts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0 }
    for (let i = 0; i < 400; i++) {
      for (const e of buildSession({ ...base, questions, flashcards: [], srs: {} })) counts[e.id[0]]++
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    for (const [d, w] of Object.entries(WEIGHTS)) expect(Math.abs((counts[d] / total) * 100 - w)).toBeLessThan(3)
  })

  it('shuffles option display order but keeps every option id', () => {
    const s = buildSession({ ...base, questions: [question('1.1', 1)], flashcards: [], srs: {} })
    expect([...(s[0].order ?? [])].sort()).toEqual(['a', 'b', 'c', 'd'])
  })
})
