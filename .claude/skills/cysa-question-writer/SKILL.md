---
name: cysa-question-writer
description: Write original, exam-aligned CompTIA CySA+ practice questions, flashcards and PBQ-style scenarios tagged to official objectives. Use whenever adding or editing study content in src/data/.
---

# CySA+ Question Writer

Generate study content that trains for the real exam, not generic security trivia.

## Before writing anything
1. Read `CLAUDE.md` and confirm `EXAM_VERSION` is set and the objectives table is
   filled in. If not, stop and ask Kye.
2. Pick the target objective(s). If Kye didn't name one, choose the objective with
   the fewest questions relative to its domain weight (count existing files in
   `src/data/questions/`).
3. Skim existing questions for that objective so you don't duplicate them.
4. When syncing from `notes/notebook.md`, use Kye's notes as the primary source
   so questions match what his course taught, but phrase answers in official
   CS0-004 exam wording where they differ (see "Known course-vs-exam wording
   differences" in CLAUDE.md). Record the source video in a `"video": 19` field.

## Question types
- `mcq`: one correct answer, 4 options
- `multi`: "choose two/three", state the number in the stem
- `scenario`: a realistic artifact (log lines, SIEM alert, Nmap/vuln-scan output,
  email headers, CVSS vector, firewall rule) followed by 1–3 questions about it
- `flashcard`: term/concept front, concise answer back

Aim for roughly 60% mcq, 15% multi, 25% scenario per batch. CySA+ rewards applied
analysis, so favour "what should the analyst do NEXT / FIRST / BEST" stems.

## Writing rules
- **Original only.** Never reproduce or closely paraphrase questions from
  CertMaster, Sybex, Dion, Messer or any published bank.
- **Stem:** a realistic analyst situation, one clear question. No trick wording,
  no double negatives.
- **Distractors:** each wrong option must be something a competent analyst might
  actually do or believe, wrong only because of:
  - **order**: a real step done too early or too late (e.g. containment before triage,
    scoping logs while exfiltration is still running);
  - **scope**: fixes one environment or layer and misses the other (e.g. blocks the IP
    but leaves the stolen key valid);
  - **timing/phase**: the right tool in the wrong phase (e.g. runtime detection where a
    pre-deployment scan is needed);
  - **adjacent concept**: a real term from a neighbouring topic.
  Never write reckless/destructive, unethical (hiding or misreporting risk), "do
  nothing / ignore / wait and see", joke, or "all/none of the above" options.
- **Truthful distractors:** if a distractor is a true statement that doesn't answer the
  question, its `why` says so ("True, but…"). Never call a true statement false. A
  distractor that is false must have a `why` stating the correct fact.
- **Length and detail:** options are similar in length and detail (roughly 60–100
  characters for sentence options; term-style options stay short and similar). The
  correct option should be the longest in only about a quarter of questions, chosen at
  random, and should not be the shortest by habit either. `npm run validate` warns when
  the correct option is the longest or shortest in more than 40% of questions, or when a
  question's options differ by more than 2× in length.
- **Explanations:** explain why the correct answer is right AND one line on why
  each distractor is wrong (in its `why`, naming the order, scope, timing or concept
  error). This is where most of the learning happens.
- **Difficulty:** tag 1 (recall), 2 (apply), 3 (analyse/prioritise). Target mostly 2–3.
- **Accuracy:** ports, protocols, CVSS metric names, ATT&CK technique IDs, tool
  flags and IR phase names must be exact. If you're not certain, set
  `"review": true` and say what to verify.
- **Artifacts:** use fictional, safe data: RFC 5737 IPs (192.0.2.x, 198.51.100.x,
  203.0.113.x), example.com domains, made-up hostnames/usernames.

## Output schema
Append to `src/data/questions/<domain-number>.json` (array):

```json
{
  "id": "2.3-014",
  "examVersion": "CS0-004",
  "objective": "2.3",
  "type": "mcq",
  "difficulty": 2,
  "stem": "…",
  "artifact": null,
  "options": [
    { "id": "a", "text": "…", "why": "…" },
    { "id": "b", "text": "…", "why": "…" },
    { "id": "c", "text": "…", "why": "…" },
    { "id": "d", "text": "…", "why": "…" }
  ],
  "correct": ["b"],
  "explanation": "…",
  "tags": ["vulnerability-prioritisation", "cvss"],
  "review": false,
  "video": 14
}
```

- `id` = `<objective>-<3-digit sequence>`, unique.
- `artifact` = string (code block content) for scenarios, otherwise null.
- `correct` is an array even for single-answer questions.
- `video` = the source video number (required; the app only quizzes watched videos).
- Flashcards go to `src/data/flashcards/<domain-number>.json` with
  `id, examVersion, objective, front, back, tags, video` (optional `review`).
  Flashcard ids use an `fc-` prefix so they never collide with question ids: `fc-2.4-003`.

## After writing
1. Run `npm run validate` and fix all errors.
2. Report back briefly: how many items were added per objective, how many are
   flagged `review: true`, and which objective is now the most under-covered.
