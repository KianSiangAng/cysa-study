---
name: sync-notes
description: Sync Kye's CySA+ study notebook (notes/notebook.md) into the site - regenerate notes.json, write questions and flashcards for newly watched videos, and advance progress. Use when Kye says "sync notes" or has pushed a new notebook export.
---

# Sync notes

Turns new notebook entries into study content. The parsing is deterministic
(`npm run sync-notes`); the writing uses the `cysa-question-writer` skill.

## Steps

1. **Get the latest export.** `git fetch origin main` and merge it so `notes/notebook.md`
   is current. If the file hasn't changed since the last sync, say so and stop.

2. **Parse.** Run `npm run sync-notes`.
   - It fails on unknown objectives, malformed labels or blocks whose video isn't in the
     Video Log. Don't "fix" Kye's notebook yourself; report the exact line and ask him.
   - Warnings such as "Video N has no notes block" are expected for demos or videos folded
     into a range block. Mention them, then carry on.
   - The **work list** at the end = blocks with videos newer than `lastSyncedVideo`.

3. **Write content per block** on the work list with `cysa-question-writer`:
   - Source = that block's `markdown` in `src/data/notes.json` (Kye's notes come first;
     use exam wording where the course differs, e.g. control types are
     Administrative/Technical/Physical).
   - Volume: roughly **3–5 questions and 2–4 flashcards per block**, scaled by word count
     (≈100 words → 3 + 2; 200+ words → 5 + 4). A tiny block (< 50 words) may get 1–2 questions.
   - Tag every item with the block's `objective` and `video` = the **highest** video in the block.
   - Ids continue each objective's sequence: questions `1.1-007`, flashcards `fc-1.1-004`.
   - Append to `src/data/questions/<domain>.json` and `src/data/flashcards/<domain>.json`.

4. **Advance progress.** Run `npm run sync-notes -- --mark-synced`. This sets
   `lastSyncedVideo` and `watchedThroughVideo` to the latest logged video.

5. **Check.** Run `npm run validate` and `npm test` and fix every error. Look over the warnings
   (review flags, domain balance, course-only wording).

6. **Commit in small steps**, then push:
   1. `src/data/notes.json` ("Sync notes through video N")
   2. content, one commit per domain touched
   3. `src/data/progress.json`

7. **Report back briefly:** items added per objective, how many are `review: true` (and
   what to verify), and which objective is now the most under-covered relative to
   its domain weight.
