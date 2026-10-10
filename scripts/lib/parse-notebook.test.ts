import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import objectives from '../../src/data/objectives.json'
import { parseNotebook } from './parse-notebook.ts'

const OBJECTIVES = new Set(objectives.domains.flatMap((d) => d.objectives.map((o) => o.id)))
const fixture = readFileSync(join(import.meta.dirname, 'fixtures', 'notebook.2026-10-10.md'), 'utf8')
const result = parseNotebook(fixture, OBJECTIVES)
const block = (id: string) => {
  const b = result.blocks.find((x) => x.id === id)
  if (!b) throw new Error(`no block ${id}`)
  return b
}

describe('parseNotebook: real export (2026-10-10)', () => {
  it('parses cleanly', () => {
    expect(result.errors).toEqual([])
  })

  it('reads 24 videos from the log, skipping the quiz row', () => {
    expect(result.videos.map((v) => v.n)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1))
    expect(result.videos.some((v) => /quiz/i.test(v.topic))).toBe(false)
    expect(result.videos[0]).toEqual({ n: 1, topic: 'Welcome and Course Overview', objective: null })
    expect(result.videos[18]).toMatchObject({ n: 19, objective: '1.1' })
  })

  it('finds the 11 blocks with the right videos and objectives', () => {
    expect(result.blocks.map((b) => [b.id, b.objective])).toEqual([
      ['v6-9', '1.5'],
      ['v18', '1.1'],
      ['v19', '1.1'],
      ['v20', '1.1'],
      ['v21', '1.1'],
      ['v22', '1.1'],
      ['v24', '1.1'],
      ['v11-14', '2.4'],
      ['v16', '2.4'],
      ['v17', '2.4'],
      ['v10', '4.2'],
    ])
    expect(block('v6-9').videos).toEqual([6, 7, 8, 9])
    expect(block('v11-14').videos).toEqual([11, 12, 13, 14])
    expect(block('v6-9').title).toBe('SOC basics')
    expect(block('v21').title).toBe('Containerization Concepts — Docker, Kubernetes')
  })

  it('dedents nested list-item blocks so they render as top-level lists', () => {
    for (const id of ['v19', 'v20', 'v21', 'v22', 'v24']) {
      const first = block(id).markdown.split('\n')[0]
      expect(first, id).toMatch(/^- \S/)
    }
    expect(block('v19').markdown).toMatch(/^- Built on microservices/)
  })

  it('warns (not errors) for logged videos with no block: 15 and 23', () => {
    const missing = result.warnings.filter((w) => /no notes block/.test(w))
    expect(missing).toHaveLength(2)
    expect(missing[0]).toMatch(/^Video 15 /)
    expect(missing[1]).toMatch(/^Video 23 /)
    expect(result.blocks.some((b) => b.videos.includes(15) || b.videos.includes(23))).toBe(false)
  })

  it('does not treat "(per vid 15)" as a label; that text stays inside the 11–14 block', () => {
    expect(block('v11-14').markdown).toContain('(per vid 15)')
  })

  it('stops at italic "Still to come" lines and headings', () => {
    for (const b of result.blocks) {
      expect(b.markdown, b.id).not.toMatch(/Still to come|Notes will fill in/)
      expect(b.markdown, b.id).not.toMatch(/^#/m)
    }
    expect(block('v10').markdown).not.toMatch(/Glossary/)
  })

  describe('content boundaries', () => {
    it('block 18 contains nothing from blocks 19–22 or 24', () => {
      const md = block('v18').markdown
      expect(md).toContain('SDN')
      expect(md).toContain('IAM is the perimeter')
      for (const leak of ['Cloud Native', 'Checkov', 'VM escape', 'Falco', 'BOLA', 'MDM', 'Type 1 hypervisors', 'OWASP'])
        expect(md, leak).not.toContain(leak)
    })

    it('block 11–14 contains nothing from blocks 16–17', () => {
      const md = block('v11-14').markdown
      expect(md).toContain('Inherent risk')
      expect(md).toContain('Compensating controls')
      for (const leak of ['SLO', 'Governance', 'BIA', 'NIST CSF', 'Business Impact Analysis'])
        expect(md, leak).not.toContain(leak)
    })

    it('each nested block contains only its own topic', () => {
      expect(block('v19').markdown).not.toMatch(/hypervisor/i)
      expect(block('v20').markdown).not.toMatch(/Kubernetes/)
      expect(block('v22').markdown).not.toMatch(/MDM/)
      expect(block('v16').markdown).not.toMatch(/NIST CSF/)
    })
  })
})

describe('parseNotebook: rules', () => {
  const log = `| # | Topic | Objective |\n| --- | --- | --- |\n| 1 | A | 1.1 |\n| 2 | B | 1.1 |\n| 3 | C | 2.4 |\n`

  it('a label nested deeper than the open block still ends it', () => {
    const md = `${log}\n**Parent (vid 1 · obj 1.1)**\n\n- parent fact\n  - deeper\n    - **Child (vid 2 · obj 1.1)**\n      - child fact\n`
    const r = parseNotebook(md, OBJECTIVES)
    expect(r.blocks.map((b) => b.id)).toEqual(['v1', 'v2'])
    expect(r.blocks[0].markdown).not.toContain('child fact')
    expect(r.blocks[0].markdown).not.toContain('Child')
    expect(r.blocks[1].markdown).toBe('- child fact')
  })

  it('fails on unknown objectives, unlogged videos, reversed ranges and malformed labels', () => {
    const bad = (body: string) => parseNotebook(`${log}\n${body}\n`, OBJECTIVES).errors.join('\n')
    expect(bad('**X (vid 1 · obj 1.9)**')).toMatch(/unknown objective 1\.9/)
    expect(bad('**X (vid 7 · obj 1.1)**')).toMatch(/video 7 is not in the Video Log/)
    expect(bad('**X (vids 3–1 · obj 1.1)**')).toMatch(/reversed/)
    expect(bad('**X (vid 1 obj 1.1)**')).toMatch(/Unparseable note label/)
    expect(parseNotebook(log.replace('| 2.4 |', '| 9.9 |'), OBJECTIVES).errors.join()).toMatch(/unrecognised objective "9\.9"/)
  })

  it('accepts Google Docs escapes and hyphen ranges', () => {
    const r = parseNotebook(`${log}\n**Esc (vids 1\\-2 · obj 1\\.1)**\n- fact\n`, OBJECTIVES)
    expect(r.errors).toEqual([])
    expect(r.blocks[0]).toMatchObject({ id: 'v1-2', videos: [1, 2], objective: '1.1' })
  })

  it('warns when a block objective differs from the logged objective', () => {
    const r = parseNotebook(`${log}\n**X (vid 3 · obj 1.1)**\n- fact\n`, OBJECTIVES)
    expect(r.warnings.join()).toMatch(/tagged 1\.1 but video 3 is logged as 2\.4/)
  })
})
