import { z } from 'zod'

const objectiveId = z.string().regex(/^[1-4]\.\d$/, 'objective must look like "2.3"')
const video = z.number().int().positive()

export const optionSchema = z.object({
  id: z.string().regex(/^[a-z]$/, 'option id must be a single lowercase letter'),
  text: z.string().min(1),
  why: z.string().min(1, 'every option needs a "why"'),
})

export const questionSchema = z.strictObject({
  id: z.string().regex(/^\d\.\d-\d{3}$/, 'question id must look like "2.3-014"'),
  examVersion: z.literal('CS0-004'),
  objective: objectiveId,
  type: z.enum(['mcq', 'multi', 'scenario']),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  stem: z.string().min(1),
  artifact: z.string().min(1).nullable(),
  options: z.array(optionSchema).min(2),
  correct: z.array(z.string()).min(1),
  explanation: z.string().min(1),
  tags: z.array(z.string()),
  review: z.boolean(),
  video,
})

export const flashcardSchema = z.strictObject({
  id: z.string().regex(/^fc-\d\.\d-\d{3}$/, 'flashcard id must look like "fc-2.3-014"'),
  examVersion: z.literal('CS0-004'),
  objective: objectiveId,
  front: z.string().min(1),
  back: z.string().min(1),
  tags: z.array(z.string()),
  review: z.boolean().optional(),
  video,
})

export type QuestionInput = z.infer<typeof questionSchema>
export type FlashcardInput = z.infer<typeof flashcardSchema>
