import { describe, expect, it } from 'vitest'
import objectives from '../../src/data/objectives.json'
import { statedAnswerCount, validateContent, type ContentInput } from './validate.ts'

const q = (over: Record<string, unknown> = {}) => ({
  id: '2.4-001',
  examVersion: 'CS0-004',
  objective: '2.4',
  type: 'mcq',
  difficulty: 2,
  stem: 'Which control type is a firewall rule?',
  artifact: null,
  options: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: `opt ${id}`, why: `why ${id}` })),
  correct: ['b'],
  explanation: 'Because.',
  tags: [],
  review: false,
  video: 14,
  ...over,
})

const run = (questions: unknown[], flashcards: unknown[] = []): ReturnType<typeof validateContent> => {
  const input: ContentInput = {
    objectives,
    lastSyncedVideo: 24,
    questions: { '1': [], '2': questions, '3': [], '4': [] },
    flashcards: { '1': [], '2': flashcards, '3': [], '4': [] },
  }
  return validateContent(input)
}

describe('validateContent', () => {
  it('accepts a well-formed question', () => {
    expect(run([q()]).errors).toEqual([])
  })

  it('rejects unknown objectives, id mismatches and wrong domain files', () => {
    expect(run([q({ id: '2.9-001', objective: '2.9' })]).errors.join()).toMatch(/unknown objective/)
    expect(run([q({ id: '2.3-001' })]).errors.join()).toMatch(/doesn't match objective/)
    expect(run([q({ id: '1.1-001', objective: '1.1' })]).errors.join()).toMatch(/domain 2 file/)
  })

  it('rejects duplicates, bad correct ids, missing why, and future videos', () => {
    expect(run([q(), q()]).errors.join()).toMatch(/duplicate id/)
    expect(run([q({ correct: ['z'] })]).errors.join()).toMatch(/not an option/)
    const noWhy = q({ options: [{ id: 'a', text: 'x', why: '' }, ...q().options.slice(1)] })
    expect(run([noWhy]).errors.join()).toMatch(/why/)
    expect(run([q({ video: 30 })]).errors.join()).toMatch(/past lastSyncedVideo/)
  })

  it('enforces mcq shape and multi answer counts', () => {
    expect(run([q({ correct: ['a', 'b'] })]).errors.join()).toMatch(/exactly 1 correct/)
    expect(run([q({ type: 'multi', correct: ['a', 'b'] })]).errors.join()).toMatch(/how many to choose/)
    expect(run([q({ type: 'multi', stem: 'Pick one? (Choose three.)', correct: ['a', 'b'] })]).errors.join()).toMatch(
      /says choose 3/,
    )
    expect(run([q({ type: 'multi', stem: 'Which apply? (Choose two.)', correct: ['a', 'b'] })]).errors).toEqual([])
  })

  it('requires an artifact on scenarios', () => {
    expect(run([q({ type: 'scenario' })]).errors.join()).toMatch(/artifact/)
  })

  it('validates flashcard ids and warns on course-only wording', () => {
    const fc = { id: 'fc-2.4-001', examVersion: 'CS0-004', objective: '2.4', front: 'f', back: 'b', tags: [], video: 14 }
    expect(run([], [fc]).errors).toEqual([])
    expect(run([], [{ ...fc, id: '2.4-001' }]).errors.join()).toMatch(/flashcard id/)
    expect(run([q({ stem: 'Is training an operational control?' })]).warnings.join()).toMatch(/course-only/)
  })
})

describe('statedAnswerCount', () => {
  it('reads words and digits', () => {
    expect(statedAnswerCount('(Choose TWO.)')).toBe(2)
    expect(statedAnswerCount('Select 3 of the following')).toBe(3)
    expect(statedAnswerCount('Which is best?')).toBeNull()
  })
})
