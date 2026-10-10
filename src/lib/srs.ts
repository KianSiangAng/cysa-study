import { addDays, startOfDay } from './dates.ts'

/**
 * Leitner spaced repetition. Correct moves an item up one box (longer gap);
 * wrong sends it back to box 1 (due tomorrow). Due dates snap to local midnight
 * so an item that's "due today" stays due for the whole day.
 */
export const INTERVAL_DAYS = [1, 3, 7, 16, 35] as const
export const MAX_BOX = INTERVAL_DAYS.length

export interface SrsEntry {
  box: number
  dueAt: number
  seen: number
  correct: number
  lastSeenAt: number
}

export type SrsState = Record<string, SrsEntry>

export function grade(entry: SrsEntry | undefined, wasCorrect: boolean, now: number): SrsEntry {
  const prevBox = entry?.box ?? 1
  const box = wasCorrect ? Math.min(prevBox + 1, MAX_BOX) : 1
  return {
    box,
    dueAt: addDays(startOfDay(now), INTERVAL_DAYS[box - 1]),
    seen: (entry?.seen ?? 0) + 1,
    correct: (entry?.correct ?? 0) + (wasCorrect ? 1 : 0),
    lastSeenAt: now,
  }
}

export function isDue(entry: SrsEntry | undefined, now: number): boolean {
  return entry !== undefined && entry.dueAt <= now
}

/** Count of items in `ids` that are due now. Unknown ids in state are simply ignored. */
export function dueCount(state: SrsState, ids: Iterable<string>, now: number): number {
  let n = 0
  for (const id of ids) if (isDue(state[id], now)) n++
  return n
}
