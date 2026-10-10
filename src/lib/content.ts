import objectivesJson from '../data/objectives.json'
import progressJson from '../data/progress.json'
import notesJson from '../data/notes.json'
import q1 from '../data/questions/1.json'
import q2 from '../data/questions/2.json'
import q3 from '../data/questions/3.json'
import q4 from '../data/questions/4.json'
import f1 from '../data/flashcards/1.json'
import f2 from '../data/flashcards/2.json'
import f3 from '../data/flashcards/3.json'
import f4 from '../data/flashcards/4.json'
import type { Domain, DomainId, Flashcard, NotesData, Progress, Question } from './types.ts'

// JSON is validated in CI (npm run validate), so the casts here are safe.
export const domains = objectivesJson.domains as Domain[]
export const progress = progressJson as Progress
export const notes = notesJson as NotesData
export const questions = [q1, q2, q3, q4].flat() as Question[]
export const flashcards = [f1, f2, f3, f4].flat() as Flashcard[]

export const weights = Object.fromEntries(domains.map((d) => [d.id, d.weight])) as Record<DomainId, number>
export const questionById = new Map(questions.map((q) => [q.id, q]))
export const flashcardById = new Map(flashcards.map((f) => [f.id, f]))
export const objectiveName = new Map(domains.flatMap((d) => d.objectives.map((o) => [o.id, o.name])))

const watched = <T extends { video: number }>(i: T) => i.video <= progress.watchedThroughVideo
export const watchedIds = [...questions.filter(watched), ...flashcards.filter(watched)].map((i) => i.id)
