import { describe, it, expect } from 'vitest'
import { validateChallenge } from './challengeValidator'
import type { VimState } from '../types/vim'
import { createInitialState } from './vimEngine'

function makeState(overrides: Partial<VimState> = {}): VimState {
  return {
    ...createInitialState(['hello world', 'foo bar', 'baz']),
    ...overrides,
  }
}

describe('cursorAt condition', () => {
  it('returns true when cursor matches position', () => {
    const state = makeState({ cursor: { row: 1, col: 3 } })
    expect(validateChallenge(state, { type: 'cursorAt', position: { row: 1, col: 3 } })).toBe(true)
  })

  it('returns false when cursor row differs', () => {
    const state = makeState({ cursor: { row: 0, col: 3 } })
    expect(validateChallenge(state, { type: 'cursorAt', position: { row: 1, col: 3 } })).toBe(false)
  })

  it('returns false when cursor col differs', () => {
    const state = makeState({ cursor: { row: 1, col: 2 } })
    expect(validateChallenge(state, { type: 'cursorAt', position: { row: 1, col: 3 } })).toBe(false)
  })
})

describe('bufferEquals condition', () => {
  it('returns true when buffer matches expected exactly', () => {
    const state = makeState({ buffer: ['hello', 'world'] })
    expect(validateChallenge(state, { type: 'bufferEquals', expected: ['hello', 'world'] })).toBe(true)
  })

  it('returns false when buffer differs', () => {
    const state = makeState({ buffer: ['hello', 'world'] })
    expect(validateChallenge(state, { type: 'bufferEquals', expected: ['hello', 'WORLD'] })).toBe(false)
  })

  it('returns false when buffer has different length', () => {
    const state = makeState({ buffer: ['hello'] })
    expect(validateChallenge(state, { type: 'bufferEquals', expected: ['hello', 'world'] })).toBe(false)
  })
})

describe('allTargetsReached condition (inOrder: false)', () => {
  it('returns true when all targets in visitedPositions', () => {
    const targets = [{ row: 0, col: 0 }, { row: 1, col: 3 }]
    const visited = [{ row: 1, col: 3 }, { row: 0, col: 0 }, { row: 2, col: 1 }]
    const state = makeState({ visitedPositions: visited } as Partial<VimState>)
    expect(validateChallenge(state, { type: 'allTargetsReached', targets, inOrder: false })).toBe(true)
  })

  it('returns false when a target is missing', () => {
    const targets = [{ row: 0, col: 0 }, { row: 1, col: 3 }]
    const visited = [{ row: 0, col: 0 }]
    const state = makeState({ visitedPositions: visited } as Partial<VimState>)
    expect(validateChallenge(state, { type: 'allTargetsReached', targets, inOrder: false })).toBe(false)
  })
})

describe('allTargetsReached condition (inOrder: true)', () => {
  it('returns true when targets visited in correct order', () => {
    const targets = [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }]
    const visited = [{ row: 0, col: 0 }, { row: 0, col: 5 }, { row: 1, col: 0 }, { row: 2, col: 0 }]
    const state = makeState({ visitedPositions: visited } as Partial<VimState>)
    expect(validateChallenge(state, { type: 'allTargetsReached', targets, inOrder: true })).toBe(true)
  })

  it('returns false when targets visited out of order', () => {
    const targets = [{ row: 0, col: 0 }, { row: 1, col: 0 }]
    const visited = [{ row: 1, col: 0 }, { row: 0, col: 0 }]
    const state = makeState({ visitedPositions: visited } as Partial<VimState>)
    expect(validateChallenge(state, { type: 'allTargetsReached', targets, inOrder: true })).toBe(false)
  })
})

describe('allEnemiesDeleted condition', () => {
  it('returns true when no enemy markers remain in buffer', () => {
    const state = makeState({ buffer: ['clean line', 'no enemies here'] })
    expect(validateChallenge(state, { type: 'allEnemiesDeleted' })).toBe(true)
  })

  it('returns false when [X] enemy token present', () => {
    const state = makeState({ buffer: ['kill [X] now'] })
    expect(validateChallenge(state, { type: 'allEnemiesDeleted' })).toBe(false)
  })

  it('returns false when >>><< enemy token present', () => {
    const state = makeState({ buffer: ['>>><<'] })
    expect(validateChallenge(state, { type: 'allEnemiesDeleted' })).toBe(false)
  })
})

describe('motionUsed condition', () => {
  it('returns true when motionUsed count is met', () => {
    const state = makeState({ motionCounts: { w: 3 } } as Partial<VimState>)
    expect(validateChallenge(state, { type: 'motionUsed', motionType: 'w', count: 3 })).toBe(true)
  })

  it('returns true when motionUsed count is exceeded', () => {
    const state = makeState({ motionCounts: { w: 5 } } as Partial<VimState>)
    expect(validateChallenge(state, { type: 'motionUsed', motionType: 'w', count: 3 })).toBe(true)
  })

  it('returns false when count not reached', () => {
    const state = makeState({ motionCounts: { w: 2 } } as Partial<VimState>)
    expect(validateChallenge(state, { type: 'motionUsed', motionType: 'w', count: 3 })).toBe(false)
  })

  it('returns false when motion has no count recorded', () => {
    const state = makeState({ motionCounts: {} } as Partial<VimState>)
    expect(validateChallenge(state, { type: 'motionUsed', motionType: 'w', count: 1 })).toBe(false)
  })
})
