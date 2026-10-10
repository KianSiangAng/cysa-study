import { flashcardSchema, questionSchema, type FlashcardInput, type QuestionInput } from '../schema.ts'

export interface ContentInput {
  objectives: { domains: { id: string; name: string; weight: number; objectives: { id: string }[] }[] }
  lastSyncedVideo: number
  /** Keyed by domain id ("1".."4"), as loaded from questions/<d>.json and flashcards/<d>.json. */
  questions: Record<string, unknown[]>
  flashcards: Record<string, unknown[]>
}

export interface ValidationResult {
  errors: string[]
  warnings: string[]
}

const NUMBER_WORDS: Record<string, number> = { two: 2, three: 3, four: 4 }
/** Course-only control categories; CS0-004 uses Administrative/Technical/Physical. */
const COURSE_WORDING = /\b(managerial|operational)\s+controls?\b/i

/** "Choose two", "(Select THREE)", "select 2" → the stated answer count, or null. */
export function statedAnswerCount(stem: string): number | null {
  const m = stem.match(/\b(?:choose|select|pick)\s+(two|three|four|[2-4])\b/i)
  if (!m) return null
  const word = m[1].toLowerCase()
  return NUMBER_WORDS[word] ?? Number(word)
}

export function validateContent(input: ContentInput): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const objectiveIds = new Set(input.objectives.domains.flatMap((d) => d.objectives.map((o) => o.id)))
  const seenIds = new Set<string>()
  const counts: Record<string, number> = {}
  let reviewCount = 0

  const checkCommon = (where: string, item: QuestionInput | FlashcardInput, domain: string, idPrefix: string) => {
    if (seenIds.has(item.id)) errors.push(`${where}: duplicate id ${item.id}`)
    seenIds.add(item.id)
    if (!objectiveIds.has(item.objective)) errors.push(`${where}: unknown objective ${item.objective}`)
    if (!item.id.startsWith(`${idPrefix}${item.objective}-`))
      errors.push(`${where}: id ${item.id} doesn't match objective ${item.objective}`)
    if (item.objective.split('.')[0] !== domain)
      errors.push(`${where}: objective ${item.objective} is in the domain ${domain} file`)
    if (item.video > input.lastSyncedVideo)
      errors.push(`${where}: video ${item.video} is past lastSyncedVideo ${input.lastSyncedVideo}`)
    if (item.review) reviewCount++
    counts[domain] = (counts[domain] ?? 0) + 1
  }

  for (const [domain, items] of Object.entries(input.questions)) {
    items.forEach((raw, i) => {
      const where = `questions/${domain}.json[${i}]`
      const parsed = questionSchema.safeParse(raw)
      if (!parsed.success) {
        for (const issue of parsed.error.issues) errors.push(`${where}: ${issue.path.join('.')} ${issue.message}`)
        return
      }
      const q = parsed.data
      const at = `${where} (${q.id})`
      checkCommon(at, q, domain, '')

      const optionIds = q.options.map((o) => o.id)
      if (new Set(optionIds).size !== optionIds.length) errors.push(`${at}: duplicate option ids`)
      for (const c of q.correct) if (!optionIds.includes(c)) errors.push(`${at}: correct "${c}" is not an option`)
      if (new Set(q.correct).size !== q.correct.length) errors.push(`${at}: duplicate correct ids`)

      if (q.type === 'mcq') {
        if (q.options.length !== 4) errors.push(`${at}: mcq needs exactly 4 options`)
        if (q.correct.length !== 1) errors.push(`${at}: mcq needs exactly 1 correct answer`)
      }
      if (q.type === 'multi' && q.correct.length < 2) errors.push(`${at}: multi needs at least 2 correct answers`)
      if (q.type === 'scenario' && !q.artifact) errors.push(`${at}: scenario needs an artifact`)
      if (q.correct.length > 1) {
        const stated = statedAnswerCount(q.stem)
        if (stated === null) errors.push(`${at}: stem must say how many to choose (e.g. "Choose two")`)
        else if (stated !== q.correct.length)
          errors.push(`${at}: stem says choose ${stated} but ${q.correct.length} are correct`)
      }
      const text = [q.stem, ...q.options.map((o) => o.text), q.explanation].join(' ')
      if (COURSE_WORDING.test(text)) warnings.push(`${at}: uses course-only control wording; prefer exam terms`)
    })
  }

  for (const [domain, items] of Object.entries(input.flashcards)) {
    items.forEach((raw, i) => {
      const where = `flashcards/${domain}.json[${i}]`
      const parsed = flashcardSchema.safeParse(raw)
      if (!parsed.success) {
        for (const issue of parsed.error.issues) errors.push(`${where}: ${issue.path.join('.')} ${issue.message}`)
        return
      }
      const f = parsed.data
      checkCommon(`${where} (${f.id})`, f, domain, 'fc-')
      if (COURSE_WORDING.test(`${f.front} ${f.back}`) && !/exam/i.test(f.back))
        warnings.push(`${where} (${f.id}): uses course-only control wording without noting the exam term`)
    })
  }

  if (reviewCount > 0) warnings.push(`${reviewCount} item(s) flagged review: true`)
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (total > 0) {
    for (const d of input.objectives.domains) {
      const share = Math.round(((counts[d.id] ?? 0) / total) * 100)
      if (Math.abs(share - d.weight) > 10)
        warnings.push(`Domain ${d.id} is ${share}% of content vs ${d.weight}% exam weight`)
    }
  }
  return { errors, warnings }
}
