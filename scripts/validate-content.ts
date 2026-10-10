import { join } from 'node:path'
import { DATA, DOMAINS, readJson } from './lib/data.ts'
import { validateContent, type ContentInput } from './lib/validate.ts'

const input: ContentInput = {
  objectives: readJson(join(DATA, 'objectives.json')),
  lastSyncedVideo: readJson<{ lastSyncedVideo: number }>(join(DATA, 'progress.json')).lastSyncedVideo,
  questions: Object.fromEntries(DOMAINS.map((d) => [d, readJson<unknown[]>(join(DATA, 'questions', `${d}.json`))])),
  flashcards: Object.fromEntries(DOMAINS.map((d) => [d, readJson<unknown[]>(join(DATA, 'flashcards', `${d}.json`))])),
}

const { errors, warnings } = validateContent(input)
const count = (r: Record<string, unknown[]>) => Object.values(r).reduce((n, a) => n + a.length, 0)
console.log(`Checked ${count(input.questions)} questions and ${count(input.flashcards)} flashcards.`)
for (const w of warnings) console.warn(`warn  ${w}`)
for (const e of errors) console.error(`error ${e}`)
if (errors.length > 0) {
  console.error(`\n${errors.length} error(s).`)
  process.exit(1)
}
console.log('Content OK.')
