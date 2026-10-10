import { useCallback, useState } from 'react'
import { grade, type SrsState } from './srs.ts'
import { KEYS, load, save } from './storage.ts'
import { recordAnswer, type WeekState } from './week.ts'

/** SRS + weekly totals, persisted on every answer so a closed app loses nothing. */
export function useStudyStore() {
  const [srs, setSrs] = useState<SrsState>(() => load(KEYS.srs, {}))
  const [week, setWeek] = useState<WeekState>(() => load(KEYS.week, {}))

  const record = useCallback((id: string, wasCorrect: boolean) => {
    const now = Date.now()
    setSrs((prev) => {
      const next = { ...prev, [id]: grade(prev[id], wasCorrect, now) }
      save(KEYS.srs, next)
      return next
    })
    setWeek((prev) => {
      const next = recordAnswer(prev, wasCorrect, now)
      save(KEYS.week, next)
      return next
    })
  }, [])

  return { srs, week, record }
}
