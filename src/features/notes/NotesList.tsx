import { useState } from 'react'
import { ObjectiveChip } from '../../components/ObjectiveChip.tsx'
import { domains, notes, progress } from '../../lib/content.ts'

export function watchedVideos() {
  return notes.videos.filter((v) => v.n <= progress.watchedThroughVideo)
}

export function NotesList() {
  const [domain, setDomain] = useState<string | null>(null)
  const videos = watchedVideos().filter((v) => !domain || v.objective?.startsWith(`${domain}.`))
  const hasNotes = new Set(notes.blocks.flatMap((b) => b.videos))

  return (
    <div className="pt-2">
      <h1 className="mb-3 text-2xl font-bold">Notes</h1>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by domain">
        <Chip active={domain === null} onClick={() => setDomain(null)} label="All" />
        {domains.map((d) => (
          <Chip key={d.id} active={domain === d.id} onClick={() => setDomain(d.id)} label={`${d.id}.0 ${d.name.split(' ')[0]}`} />
        ))}
      </div>

      {videos.length === 0 ? (
        <p className="text-muted">No notes synced yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {videos.map((v) => (
            <li key={v.n}>
              <a href={`#/notes/${v.n}`} className="flex min-h-14 items-center gap-3 px-4 py-3">
                <span className="w-7 shrink-0 text-right font-mono text-sm text-muted">{v.n}</span>
                <span className={`flex-1 ${hasNotes.has(v.n) ? '' : 'text-muted'}`}>{v.topic}</span>
                <ObjectiveChip objective={v.objective} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium ${
        active ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-text'
      }`}
    >
      {label}
    </button>
  )
}
