/**
 * npm run sync-notes               parse notes/notebook.md → src/data/notes.json, print the work list
 * npm run sync-notes -- --mark-synced   also set lastSyncedVideo/watchedThroughVideo to the latest logged video
 *
 * Deterministic: no content generation. Claude follows .claude/skills/sync-notes/SKILL.md
 * to turn the work list into questions and flashcards.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Progress } from '../src/lib/types.ts'
import { DATA, readJson, ROOT } from './lib/data.ts'
import { parseNotebook } from './lib/parse-notebook.ts'

const NOTEBOOK = join(ROOT, 'notes', 'notebook.md')
const NOTES_OUT = join(DATA, 'notes.json')
const PROGRESS = join(DATA, 'progress.json')

if (!existsSync(NOTEBOOK)) {
  console.error(`Missing ${NOTEBOOK}. Export the notebook as Markdown to notes/notebook.md first.`)
  process.exit(1)
}

const objectives = readJson<{ domains: { objectives: { id: string }[] }[] }>(join(DATA, 'objectives.json'))
const ids = new Set(objectives.domains.flatMap((d) => d.objectives.map((o) => o.id)))
const { videos, blocks, errors, warnings } = parseNotebook(readFileSync(NOTEBOOK, 'utf8'), ids)

for (const w of warnings) console.warn(`warn  ${w}`)
if (errors.length) {
  for (const e of errors) console.error(`error ${e}`)
  console.error(`\n${errors.length} error(s). notes.json not written.`)
  process.exit(1)
}

writeFileSync(NOTES_OUT, `${JSON.stringify({ videos, blocks }, null, 2)}\n`)
console.log(`Wrote src/data/notes.json: ${videos.length} videos, ${blocks.length} blocks.`)

const progress = readJson<Progress>(PROGRESS)
const latest = Math.max(0, ...videos.map((v) => v.n))
const todo = blocks.filter((b) => Math.max(...b.videos) > progress.lastSyncedVideo)
const words = (md: string) => md.split(/\s+/).filter(Boolean).length
const span = (v: number[]) => (v.length > 1 ? `${v[0]}–${v[v.length - 1]}` : `${v[0]}`)

console.log(`\nlastSyncedVideo = ${progress.lastSyncedVideo}, latest logged video = ${latest}`)
if (todo.length === 0) console.log('Work list: nothing new to generate.')
else {
  console.log(`Work list (${todo.length} block(s) to generate content for):`)
  for (const b of todo)
    console.log(`  ${b.id.padEnd(8)} obj ${b.objective}  vid ${span(b.videos).padEnd(6)} ${String(words(b.markdown)).padStart(4)} words  ${b.title}`)
}

if (process.argv.includes('--mark-synced')) {
  const next: Progress = { lastSyncedVideo: latest, watchedThroughVideo: latest }
  writeFileSync(PROGRESS, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`\nprogress.json → lastSyncedVideo = watchedThroughVideo = ${latest}`)
}
