export type ObjectiveId = string // "1.1" … "4.2"
export type DomainId = '1' | '2' | '3' | '4'

export interface Option {
  id: string
  text: string
  why: string
}

export interface Question {
  id: string
  examVersion: 'CS0-004'
  objective: ObjectiveId
  type: 'mcq' | 'multi' | 'scenario'
  difficulty: 1 | 2 | 3
  stem: string
  artifact: string | null
  options: Option[]
  correct: string[]
  explanation: string
  tags: string[]
  review: boolean
  video: number
}

export interface Flashcard {
  id: string
  examVersion: 'CS0-004'
  objective: ObjectiveId
  front: string
  back: string
  tags: string[]
  review?: boolean
  video: number
}

export type StudyItem = { kind: 'question'; item: Question } | { kind: 'flashcard'; item: Flashcard }

export interface NoteVideo {
  n: number
  topic: string
  objective: ObjectiveId | null
}

export interface NoteBlock {
  id: string
  title: string
  objective: ObjectiveId
  videos: number[]
  markdown: string
}

export interface NotesData {
  videos: NoteVideo[]
  blocks: NoteBlock[]
}

export interface Progress {
  lastSyncedVideo: number
  watchedThroughVideo: number
}

export interface Domain {
  id: DomainId
  name: string
  weight: number
  objectives: { id: ObjectiveId; name: string }[]
}

export function domainOf(objective: ObjectiveId): DomainId {
  return objective.split('.')[0] as DomainId
}
