/**
 * localStorage / sessionStorage wrappers. Every access is guarded: storage can be
 * missing, full or blocked (private mode), and the app must still work without it.
 */
const PREFIX = 'cysa:v1:'

export const KEYS = {
  srs: `${PREFIX}srs`,
  week: `${PREFIX}week`,
  session: `${PREFIX}session`,
} as const

type Area = 'local' | 'session'

function area(which: Area): Storage | null {
  try {
    return which === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function load<T>(key: string, fallback: T, which: Area = 'local'): T {
  try {
    const raw = area(which)?.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown, which: Area = 'local'): void {
  try {
    area(which)?.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage blocked: progress just isn't persisted this time.
  }
}

export function remove(key: string, which: Area = 'local'): void {
  try {
    area(which)?.removeItem(key)
  } catch {
    // ignore
  }
}
