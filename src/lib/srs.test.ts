import { describe, expect, it } from 'vitest'
import { addDays, startOfDay, weekKey } from './dates.ts'
import { dueCount, grade, isDue, MAX_BOX } from './srs.ts'
import { recordAnswer, thisWeek } from './week.ts'

// Friday 10 Oct 2026, 08:15 local
const NOW = new Date(2026, 9, 10, 8, 15).getTime()
const day = (n: number) => addDays(startOfDay(NOW), n)

describe('srs.grade', () => {
  it('a new item answered correctly goes to box 2, due in 3 days at midnight', () => {
    const e = grade(undefined, true, NOW)
    expect(e).toMatchObject({ box: 2, seen: 1, correct: 1, lastSeenAt: NOW })
    expect(e.dueAt).toBe(day(3))
  })

  it('a wrong answer resets to box 1, due tomorrow', () => {
    const e = grade({ box: 4, dueAt: 0, seen: 5, correct: 4, lastSeenAt: 0 }, false, NOW)
    expect(e).toMatchObject({ box: 1, seen: 6, correct: 4 })
    expect(e.dueAt).toBe(day(1))
  })

  it('walks the interval ladder and caps at the top box', () => {
    let e = grade(undefined, true, NOW)
    const gaps = [3]
    for (let i = 0; i < 5; i++) {
      e = grade(e, true, NOW)
      gaps.push(Math.round((e.dueAt - startOfDay(NOW)) / 86_400_000))
    }
    expect(gaps).toEqual([3, 7, 16, 35, 35, 35])
    expect(e.box).toBe(MAX_BOX)
  })

  it('isDue is false for unseen items and true from local midnight of the due day', () => {
    const e = grade(undefined, false, NOW)
    expect(isDue(undefined, NOW)).toBe(false)
    expect(isDue(e, NOW)).toBe(false)
    expect(isDue(e, day(1))).toBe(true)
  })

  it('dueCount ignores state for ids that no longer exist', () => {
    const state = { gone: grade(undefined, false, NOW), kept: grade(undefined, false, NOW) }
    expect(dueCount(state, ['kept', 'new'], day(1))).toBe(1)
  })
})

describe('week totals', () => {
  it('keys weeks by local Monday', () => {
    expect(weekKey(NOW)).toBe('2026-10-05')
    expect(weekKey(new Date(2026, 9, 11, 23, 59).getTime())).toBe('2026-10-05') // Sunday
    expect(weekKey(new Date(2026, 9, 12, 0, 1).getTime())).toBe('2026-10-12') // Monday
  })

  it('accumulates within a week and starts fresh the next week', () => {
    let s = recordAnswer({}, true, NOW)
    s = recordAnswer(s, false, NOW)
    expect(thisWeek(s, NOW)).toEqual({ answered: 2, correct: 1 })
    expect(thisWeek(s, addDays(NOW, 7))).toEqual({ answered: 0, correct: 0 })
  })
})
