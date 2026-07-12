import { describe, expect, it } from 'vitest'
import { backPainInstructions } from './back-pain-instructions'

describe('backPainInstructions', () => {
  it('has 18 exercises with unique slugs, positive durations, and text', () => {
    expect(backPainInstructions).toHaveLength(18)
    const slugs = backPainInstructions.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(18)
    for (const e of backPainInstructions) {
      expect(e.duration).toBeGreaterThan(0)
      expect(e.label.length).toBeGreaterThan(0)
      expect(e.text.length).toBeGreaterThan(0)
    }
  })
})
