import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect } from 'react'
import { ObjectiveChip } from '../../components/ObjectiveChip.tsx'
import { notes } from '../../lib/content.ts'
import { watchedVideos } from './NotesList.tsx'

const span = (v: number[]) => `${v[0]}–${v[v.length - 1]}`

export function NoteDetail({ n }: { n: number }) {
  const videos = watchedVideos()
  const i = videos.findIndex((v) => v.n === n)
  const video = videos[i]
  const blocks = notes.blocks.filter((b) => b.videos.includes(n))
  const prev = videos[i - 1]
  const next = videos[i + 1]

  useEffect(() => window.scrollTo(0, 0), [n])

  if (!video) {
    return (
      <div className="pt-2">
        <a href="#/notes" className="text-accent">← All notes</a>
        <p className="mt-4 text-muted">Video {n} isn't synced yet.</p>
      </div>
    )
  }

  return (
    <article className="pt-2">
      <a href="#/notes" className="inline-flex min-h-12 items-center text-accent">← All notes</a>
      <header className="mb-4">
        <p className="text-sm text-muted">Video {video.n}</p>
        <h1 className="text-xl font-bold leading-snug">{video.topic}</h1>
        <div className="mt-1"><ObjectiveChip objective={video.objective} /></div>
      </header>

      {blocks.length === 0 && <p className="text-muted">No separate notes for this video.</p>}
      {blocks.map((b) => (
        <section key={b.id} className="mb-5 rounded-2xl border border-line bg-surface p-4">
          <h2 className="font-semibold">{b.title}</h2>
          <p className="mb-2 text-xs text-muted">
            obj {b.objective}
            {b.videos.length > 1 && <> · Covers videos {span(b.videos)}</>}
          </p>
          <div className="notes-md">
            <Markdown remarkPlugins={[remarkGfm]}>{b.markdown}</Markdown>
          </div>
        </section>
      ))}

      <nav className="grid grid-cols-2 gap-3">
        {prev ? <PagerLink n={prev.n} label={`← ${prev.n}`} /> : <span />}
        {next ? <PagerLink n={next.n} label={`${next.n} →`} align="right" /> : <span />}
      </nav>
    </article>
  )
}

function PagerLink({ n, label, align = 'left' }: { n: number; label: string; align?: 'left' | 'right' }) {
  return (
    <a
      href={`#/notes/${n}`}
      className={`flex min-h-12 items-center rounded-xl border border-line bg-surface px-4 font-semibold ${
        align === 'right' ? 'justify-end' : ''
      }`}
    >
      {label}
    </a>
  )
}
