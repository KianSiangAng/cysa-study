/**
 * Parses Kye's study notebook (a Markdown export) into videos + note blocks.
 *
 * Video Log: a `| # | Topic | Objective |` table. Rows whose # isn't a number
 * (e.g. quizzes) are skipped; an objective of "—" means none.
 *
 * Note blocks start at a bold label that opens a paragraph or list item:
 *   **Title (vid 18 · obj 1.1)**
 *   - **Title (vid 19 · obj 1.1)**
 *   **Title (vids 6–9 · obj 1.5)**
 * A block runs until the next label (at ANY depth), the next heading, or a
 * standalone italic line (e.g. "*Still to come…*").
 */

export interface ParsedVideo {
  n: number
  topic: string
  objective: string | null
}

export interface ParsedBlock {
  id: string
  title: string
  objective: string
  videos: number[]
  markdown: string
}

export interface ParseResult {
  videos: ParsedVideo[]
  blocks: ParsedBlock[]
  errors: string[]
  warnings: string[]
}

const NO_OBJECTIVE = /^(—|–|-|n\/a)?$/i
const LABEL =
  /^(\s*)(?:[-*+]\s+)?\*\*(.*?)\s*\((vids?)\s+(\d+)(?:\s*[–—-]\s*(\d+))?\s*[·•|,]\s*obj(?:ective)?\s+(\d\.\d)\)\s*\*\*(.*)$/i
/** Anything that looks like it was meant to be a label, so typos fail loudly instead of vanishing. */
const LABEL_ISH = /^\s*(?:[-*+]\s+)?\*\*[^*]*\(vids?\s+\d[^)]*\bobj/i
const HEADING = /^#{1,6}\s/
const ITALIC_LINE = /^\s*(\*[^*\s][^*]*\*|_[^_\s][^_]*_)\s*$/

/** Undo Google Docs-style Markdown escapes (\. \- \( …) for matching only. */
const unescape = (line: string) => line.replace(/\\([.\-()*_#|·])/g, '$1')

export function parseNotebook(markdown: string, objectiveIds: ReadonlySet<string>): ParseResult {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const errors: string[] = []
  const warnings: string[] = []

  const videos = parseVideoLog(lines, objectiveIds, errors)
  const blocks = parseBlocks(lines, errors)
  const logged = new Map(videos.map((v) => [v.n, v]))

  for (const b of blocks) {
    if (!objectiveIds.has(b.objective)) errors.push(`Block "${b.title}": unknown objective ${b.objective}`)
    for (const n of b.videos) {
      const v = logged.get(n)
      if (!v) errors.push(`Block "${b.title}": video ${n} is not in the Video Log`)
      else if (v.objective && v.objective !== b.objective)
        warnings.push(`Block "${b.title}" is tagged ${b.objective} but video ${n} is logged as ${v.objective}`)
    }
  }
  const covered = new Set(blocks.flatMap((b) => b.videos))
  for (const v of videos)
    if (v.objective && !covered.has(v.n)) warnings.push(`Video ${v.n} (${v.topic}) has no notes block of its own`)

  return { videos, blocks, errors, warnings }
}

function cells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
}

function parseVideoLog(lines: string[], objectiveIds: ReadonlySet<string>, errors: string[]): ParsedVideo[] {
  const header = lines.findIndex((l) => {
    const c = cells(l).map((x) => x.toLowerCase())
    return l.trim().startsWith('|') && c[0] === '#' && c.includes('topic') && c.includes('objective')
  })
  if (header === -1) {
    errors.push('Video Log table (| # | Topic | Objective |) not found')
    return []
  }
  const cols = cells(lines[header]).map((x) => x.toLowerCase())
  const topicCol = cols.indexOf('topic')
  const objCol = cols.indexOf('objective')
  const videos: ParsedVideo[] = []
  for (let i = header + 1; i < lines.length && lines[i].trim().startsWith('|'); i++) {
    const row = cells(unescape(lines[i]))
    if (row.every((c) => /^:?-{3,}:?$/.test(c))) continue // separator row
    if (!/^\d+$/.test(row[0])) continue // quizzes, checkpoints, etc.
    const n = Number(row[0])
    const rawObj = row[objCol] ?? ''
    let objective: string | null = null
    if (!NO_OBJECTIVE.test(rawObj)) {
      if (objectiveIds.has(rawObj)) objective = rawObj
      else errors.push(`Video Log row ${n}: unrecognised objective "${rawObj}"`)
    }
    if (videos.some((v) => v.n === n)) errors.push(`Video Log: video ${n} appears twice`)
    videos.push({ n, topic: row[topicCol] ?? '', objective })
  }
  return videos
}

function parseBlocks(lines: string[], errors: string[]): ParsedBlock[] {
  const blocks: ParsedBlock[] = []
  const ids = new Map<string, number>()
  let current: { block: Omit<ParsedBlock, 'markdown'>; body: string[] } | null = null

  const close = () => {
    if (!current) return
    blocks.push({ ...current.block, markdown: dedent(current.body) })
    current = null
  }

  for (const raw of lines) {
    const line = unescape(raw)
    const m = line.match(LABEL)
    if (m) {
      close()
      const [, , title, , from, to, objective, rest] = m
      const start = Number(from)
      const end = to ? Number(to) : start
      if (end < start) errors.push(`Label "${title}": range ${start}–${end} is reversed`)
      const videos = Array.from({ length: Math.max(1, end - start + 1) }, (_, i) => start + i)
      const baseId = start === end ? `v${start}` : `v${start}-${end}`
      const dup = (ids.get(baseId) ?? 0) + 1
      ids.set(baseId, dup)
      current = {
        block: { id: dup > 1 ? `${baseId}-${dup}` : baseId, title: title.replace(/\s+[—–-]\s*$/, '').trim(), objective, videos },
        body: rest.trim() ? [rest.trim()] : [],
      }
      continue
    }
    if (LABEL_ISH.test(line)) {
      close()
      errors.push(`Unparseable note label: ${raw.trim()}`)
      continue
    }
    if (HEADING.test(line) || ITALIC_LINE.test(line)) {
      close()
      continue
    }
    current?.body.push(raw)
  }
  close()
  return blocks
}

/** Trim blank edges and remove the common leading indent (nested list-item blocks → top level). */
function dedent(body: string[]): string {
  let start = 0
  let end = body.length
  while (start < end && !body[start].trim()) start++
  while (end > start && !body[end - 1].trim()) end--
  const kept = body.slice(start, end)
  const indents = kept.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length)
  const min = indents.length ? Math.min(...indents) : 0
  return kept.map((l) => l.slice(Math.min(min, l.match(/^\s*/)![0].length))).join('\n')
}
