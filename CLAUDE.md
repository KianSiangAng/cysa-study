# CySA+ Study Site — Project Guide for Claude

## What this is
A personal study website to help Kye pass CompTIA CySA+. It doubles as a portfolio
piece (hosted on GitHub Pages alongside kiansiangang.github.io), so code quality and
design matter, but **learning effectiveness comes first**. Every feature should
answer: "does this help Kye pass the exam faster?"

## Exam target
- EXAM_VERSION: `CS0-004` (CySA+ V4, launched 23 June 2026)
- Target exam date: December 2026
- Format: max 85 questions, 165 minutes, pass = 750 on a 100–900 scale.
  Mix of multiple-choice and performance-based questions (PBQs).
- Do NOT reuse CS0-003-only material. CS0-004 adds new content on AI, cloud-native
  security and automation; make sure those areas get coverage.

## Exam objectives (source of truth)
Weightings verified against CompTIA's official CS0-004 objectives PDF.
Keep the official PDF in `docs/` for the full bullet-level detail of each objective.

| Domain | Name | Weight |
|--------|------|--------|
| 1.0 | Security Operations | 34% |
| 2.0 | Vulnerability Management | 26% |
| 3.0 | Incident Response and Management | 24% |
| 4.0 | Reporting and Communication | 16% |

Sub-objectives (short labels; see the PDF for full wording and bullets):
- 1.1 System and network architecture (logging, OS, cloud/virtualisation/containers/APIs, device mgmt, ZTNA/SASE, IAM/PAM, encryption, OT/ICS)
- 1.2 Indicators of malicious activity (network, host, app, cloud, identity, social engineering, email/BEC)
- 1.3 Tools to determine malicious activity (packet/log analysis, threat-intel platforms, EDR, reputation, file analysis, sandboxing, regex, file formats, scripting)
- 1.4 Threat intelligence and threat hunting (actors, TTPs, ATT&CK, IoCs, STRIDE, deception)
- 1.5 Efficiency and process improvement (playbooks, SOAR, IaC, tuning, integrations)
- 1.6 AI in security operations (risks, governance, use cases)
- 2.1 Vulnerability scanning methods
- 2.2 Vulnerability assessment tool output
- 2.3 Prioritising and mitigating vulnerabilities (CVSS, EPSS, context, mitigations)
- 2.4 Control types, risk concepts, AppSec, third-party risk
- 3.1 Attack methodology frameworks (Kill Chain, Diamond Model, ATT&CK)
- 3.2 Incident response process
- 3.3 Incident response techniques
- 4.1 Vulnerability management reporting and communication
- 4.2 Security operations and IR reporting and communication

Known course-vs-exam wording differences (always use the EXAM wording in questions):
- Control types: course teaches 4 (Managerial/Operational/Technical/Physical);
  CS0-004 lists 3 (Administrative/Technical/Physical).

## Study notes pipeline
Kye studies with Dion Training's CS0-004 Udemy course. After each video, Claude
(in chat) updates his "CySA+ (CS0-004) Study Notebook" doc: a video log table
(# | Topic | Objective) plus notes grouped under the 4 CS0-004 domains, each block
labelled like "(vid 19 · obj 1.1)".

Sync flow ("sync notes"):
1. Kye exports the notebook as Markdown to `notes/notebook.md`.
2. Parse the video log; compare against `src/data/progress.json` (`lastSyncedVideo`).
3. For each new video with notes, generate flashcards + questions via the
   `cysa-question-writer` skill, using Kye's notes as the primary source.
4. Update `watchedThroughVideo` so quizzes only cover watched material
   (plus spaced review of earlier items).
5. Also render the notes per video in the site's Notes view.

## Commute-first UX (top priority)
- Mobile-first, one-thumb tap targets, installable PWA that works offline.
- Default session = 10 questions (~5 min); "keep going" optional.
- Track weekly totals, NOT streaks that reset to zero.
- Optional hands-free mode: read cards aloud with the Web Speech API.
- Portfolio polish is NOT a goal; exam readiness is.

Rules:
- Every question, flashcard and lesson MUST be tagged with exactly one primary
  objective ID from the list above (e.g. `"objective": "2.3"`). Untagged content is a bug.
- Content volume per domain should roughly track domain weight.
- If an objective's wording is ambiguous, ask Kye rather than guessing.

## Tech stack
- Vite + React + TypeScript, Tailwind CSS
- Static site only, no backend. Deploy to GitHub Pages via GitHub Actions.
- Progress, scores and spaced-repetition state stored in `localStorage`
  (wrap every read/write in try/catch; the app must work with empty storage).
- Content lives in JSON under `src/data/` so it can be edited without touching code.

## Folder layout
```
src/
  data/
    objectives.json        # generated from the table above
    questions/<domain>.json
    flashcards/<domain>.json
  components/
  features/
    quiz/
    flashcards/
    scenarios/             # PBQ-style log / alert analysis
    dashboard/
  lib/
    srs.ts                 # spaced repetition (SM-2 or Leitner)
    storage.ts
scripts/
  validate-content.ts      # schema + objective-tag checks, run in CI
```

## Core features (build in this order)
1. **Quiz mode**: pick domain/objective or "weighted random"; instant feedback with
   explanation for the correct answer AND each wrong option.
2. **Weak-area dashboard**: accuracy per domain and objective, weighted by exam
   weight, so the biggest-and-weakest areas surface first.
3. **Spaced repetition**: missed questions and flashcards resurface on a schedule.
4. **Scenario/PBQ practice**: short log snippets, SIEM alerts, vuln scan output,
   or CVSS vectors where Kye must analyse and choose an action.
5. **Timed mock exam**: 165-minute timer, mixed difficulty, weighted by domain.

## Content rules
- Write ORIGINAL questions only. Never copy or closely paraphrase questions from
  CompTIA CertMaster, Sybex, Dion, Messer or any other published practice bank.
- Use the `cysa-question-writer` skill for all question/flashcard generation.
- Technical facts (ports, protocols, CVSS metrics, MITRE ATT&CK IDs, tool flags)
  must be accurate. If unsure, say so in a `"review": true` field rather than guessing.
- After adding content, run `npm run validate` and fix every error.

## Working style
- Use Plan Mode for any new feature; show the plan before writing code.
- Use the frontend-design skill for UI work. Dark-mode friendly, readable on phone
  (Kye may study on the go).
- Use Context7 for library docs. Use Playwright only at milestones, not after
  every edit.
- Keep components small; prefer clarity over cleverness.
- Commit in small, descriptive steps.
