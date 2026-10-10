import { weekKey } from './dates.ts'

/** Weekly totals (not streaks): nothing resets to zero for missing a day. */
export interface WeekTotals {
  answered: number
  correct: number
}

export type WeekState = Record<string, WeekTotals>

const KEEP_WEEKS = 26

export function recordAnswer(state: WeekState, wasCorrect: boolean, now: number): WeekState {
  const key = weekKey(now)
  const cur = state[key] ?? { answered: 0, correct: 0 }
  const next: WeekState = { ...state, [key]: { answered: cur.answered + 1, correct: cur.correct + (wasCorrect ? 1 : 0) } }
  const keys = Object.keys(next).sort()
  for (const old of keys.slice(0, Math.max(0, keys.length - KEEP_WEEKS))) delete next[old]
  return next
}

export function thisWeek(state: WeekState, now: number): WeekTotals {
  return state[weekKey(now)] ?? { answered: 0, correct: 0 }
}
