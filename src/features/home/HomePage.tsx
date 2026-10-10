import { Button } from '../../components/Button.tsx'
import { progress, watchedIds } from '../../lib/content.ts'
import { navigate } from '../../lib/router.ts'
import { SESSION_SIZE } from '../../lib/session.ts'
import { dueCount, type SrsState } from '../../lib/srs.ts'
import { thisWeek, type WeekState } from '../../lib/week.ts'

export function HomePage({ srs, week }: { srs: SrsState; week: WeekState }) {
  const now = Date.now()
  const due = dueCount(srs, watchedIds, now)
  const fresh = watchedIds.filter((id) => !srs[id]).length
  const totals = thisWeek(week, now)
  const pct = totals.answered ? Math.round((totals.correct / totals.answered) * 100) : null

  return (
    <div className="flex flex-col gap-6 pt-2">
      <header>
        <h1 className="text-2xl font-bold">CySA+ Study</h1>
        <p className="text-sm text-muted">
          CS0-004 · watched through video {progress.watchedThroughVideo}
        </p>
      </header>

      {watchedIds.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="font-semibold">No questions yet</p>
          <p className="mt-1 text-muted">
            Ask Claude to <em>sync notes</em> after your next video to generate questions from your notebook.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Due today" value={due} />
            <Stat label="New" value={fresh} />
          </div>
          <Button className="min-h-16 text-lg" onClick={() => navigate('/session')}>
            Start {SESSION_SIZE}-question session
          </Button>
        </>
      )}

      <section className="rounded-2xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">This week</h2>
        <p className="mt-1 text-lg">
          <span className="font-bold">{totals.answered}</span> answered
          {pct !== null && <span className="text-muted"> · {pct}% correct</span>}
        </p>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
