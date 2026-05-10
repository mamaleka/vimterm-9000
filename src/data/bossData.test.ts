import { describe, it, expect } from 'vitest'
import { bosses } from './bossData'
import type { BossDefinition } from '../types/boss'

describe('Boss Data', () => {
  it('should export all 5 bosses', () => {
    expect(bosses).toHaveLength(5)
  })

  it('should have unique boss ids', () => {
    const ids = bosses.map((b: BossDefinition) => b.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(5)
  })

  it('should have Arrow Key Phantom in Zone 1', () => {
    const boss = bosses.find((b: BossDefinition) => b.zone === 1)
    expect(boss).toBeDefined()
    expect(boss?.name).toBe('The Arrow Key Phantom')
    expect(boss?.id).toBe('arrow-key-phantom')
  })

  it('should have Grep Golem in Zone 2', () => {
    const boss = bosses.find((b: BossDefinition) => b.zone === 2)
    expect(boss).toBeDefined()
    expect(boss?.name).toBe('The Grep Golem')
    expect(boss?.id).toBe('grep-golem')
  })

  it('should have Syntax Serpent in Zone 3', () => {
    const boss = bosses.find((b: BossDefinition) => b.zone === 3)
    expect(boss).toBeDefined()
    expect(boss?.name).toBe('The Syntax Serpent')
    expect(boss?.id).toBe('syntax-serpent')
  })

  it('should have JSON Jormungandr in Zone 4', () => {
    const boss = bosses.find((b: BossDefinition) => b.zone === 4)
    expect(boss).toBeDefined()
    expect(boss?.name).toBe('The JSON Jormungandr')
    expect(boss?.id).toBe('json-jormungandr')
  })

  it('should have Vim Wraith in Zone 5', () => {
    const boss = bosses.find((b: BossDefinition) => b.zone === 5)
    expect(boss).toBeDefined()
    expect(boss?.name).toBe('The Vim Wraith')
    expect(boss?.id).toBe('vim-wraith')
  })

  it('should have 3-5 stages per boss', () => {
    bosses.forEach((boss: BossDefinition) => {
      expect(boss.stages.length).toBeGreaterThanOrEqual(3)
      expect(boss.stages.length).toBeLessThanOrEqual(5)
    })
  })

  it('should have all 4 dialogue event types per boss', () => {
    bosses.forEach((boss: BossDefinition) => {
      expect(boss.dialogue.wrongKey).toBeDefined()
      expect(boss.dialogue.timeout).toBeDefined()
      expect(boss.dialogue.stageCleared).toBeDefined()
      expect(boss.dialogue.defeat).toBeDefined()
      expect(Array.isArray(boss.dialogue.wrongKey)).toBe(true)
      expect(Array.isArray(boss.dialogue.timeout)).toBe(true)
      expect(Array.isArray(boss.dialogue.stageCleared)).toBe(true)
      expect(Array.isArray(boss.dialogue.defeat)).toBe(true)
    })
  })

  it('should have non-empty dialogue arrays with at least 2 lines each', () => {
    bosses.forEach((boss: BossDefinition) => {
      expect(boss.dialogue.wrongKey.length).toBeGreaterThanOrEqual(2)
      expect(boss.dialogue.timeout.length).toBeGreaterThanOrEqual(2)
      expect(boss.dialogue.stageCleared.length).toBeGreaterThanOrEqual(2)
      expect(boss.dialogue.defeat.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should have non-empty ascii art strings', () => {
    bosses.forEach((boss: BossDefinition) => {
      expect(boss.asciiArt.length).toBeGreaterThan(0)
      expect(typeof boss.asciiArt).toBe('string')
    })
  })

  it('should have valid ChallengeDefinition stages with id and type', () => {
    bosses.forEach((boss: BossDefinition) => {
      boss.stages.forEach((stage) => {
        expect(stage.id).toBeDefined()
        expect(typeof stage.id).toBe('string')
        expect(stage.type).toBeDefined()
        expect(typeof stage.type).toBe('string')
        expect(stage.initialBuffer).toBeDefined()
        expect(stage.initialCursor).toBeDefined()
        expect(stage.successCondition).toBeDefined()
      })
    })
  })

  it('should have correct zone numbers', () => {
    bosses.forEach((boss: BossDefinition) => {
      expect(boss.zone).toBeGreaterThanOrEqual(1)
      expect(boss.zone).toBeLessThanOrEqual(5)
    })
  })
})
