import { describe, it, expect } from 'vitest'
import type { VimState, Position, VimMode } from './vim'
import type { SuccessCondition, ChallengeDefinition } from './challenge'
import type { PlayerState, StreakState } from './player'

describe('VimState type', () => {
  it('constructs a valid VimState', () => {
    const state: VimState = {
      mode: 'normal',
      buffer: ['hello world'],
      cursor: { row: 0, col: 0 },
      register: '',
      registerType: 'char',
      insertedText: '',
      pendingOperator: null,
      pendingCount: null,
      pendingMotion: [],
      jumpList: [],
      jumpIndex: -1,
      marks: {},
      lastFindChar: null,
      lastFindDirection: null,
      lastFindTill: false,
      searchPattern: null,
      lastAction: null,
      visitedPositions: [],
      motionCounts: {},
    }
    expect(state.mode).toBe('normal')
    expect(state.cursor.row).toBe(0)
    expect(state.cursor.col).toBe(0)
  })

  it('constructs all VimMode variants', () => {
    const modes: VimMode[] = ['normal', 'insert', 'visual', 'command']
    expect(modes).toHaveLength(4)
  })

  it('constructs a Position', () => {
    const pos: Position = { row: 2, col: 5 }
    expect(pos.row).toBe(2)
  })

  it('constructs all SuccessCondition variants', () => {
    const c1: SuccessCondition = { type: 'cursorAt', position: { row: 0, col: 0 } }
    const c2: SuccessCondition = { type: 'bufferEquals', expected: ['hello'] }
    const c3: SuccessCondition = { type: 'allTargetsReached', targets: [{ row: 0, col: 0 }], inOrder: false }
    const c4: SuccessCondition = { type: 'allEnemiesDeleted' }
    const c5: SuccessCondition = { type: 'motionUsed', motionType: 'w', count: 3 }
    expect([c1, c2, c3, c4, c5]).toHaveLength(5)
  })

  it('constructs a ChallengeDefinition', () => {
    const cd: ChallengeDefinition = {
      id: 'test-1',
      type: 'reachTarget',
      initialBuffer: ['hello'],
      initialCursor: { row: 0, col: 0 },
      successCondition: { type: 'cursorAt', position: { row: 0, col: 4 } },
      allowedMotions: ['h', 'j', 'k', 'l'],
      parTime: 10,
    }
    expect(cd.id).toBe('test-1')
  })

  it('constructs a PlayerState', () => {
    const streak: StreakState = {
      current: 5,
      longest: 10,
      lastActivityDate: '2026-05-09',
      graceUsed: false,
    }
    const player: PlayerState = {
      id: 'uuid-123',
      displayName: 'PLAYER_ONE',
      xp: 500,
      level: 4,
      streak,
      achievements: {},
      title: 'Navigator',
    }
    expect(player.level).toBe(4)
  })
})
