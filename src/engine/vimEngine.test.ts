import { describe, it, expect } from 'vitest'
import { processKey, createInitialState } from './vimEngine'

describe('createInitialState', () => {
  it('creates state with buffer and cursor at 0,0', () => {
    const state = createInitialState(['hello', 'world'])
    expect(state.buffer).toEqual(['hello', 'world'])
    expect(state.cursor).toEqual({ row: 0, col: 0 })
    expect(state.mode).toBe('normal')
  })
})

describe('h — move left', () => {
  it('moves cursor left by 1', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 3 } }, 'h')
    expect(s2.cursor.col).toBe(2)
  })

  it('stops at column 0', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, 'h')
    expect(s2.cursor.col).toBe(0)
  })
})

describe('l — move right', () => {
  it('moves cursor right by 1', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, 'l')
    expect(s2.cursor.col).toBe(1)
  })

  it('stops at last character of line', () => {
    const s = createInitialState(['hi'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 1 } }, 'l')
    expect(s2.cursor.col).toBe(1)
  })

  it('does not move on empty line', () => {
    const s = createInitialState([''])
    const s2 = processKey(s, 'l')
    expect(s2.cursor.col).toBe(0)
  })
})

describe('j — move down', () => {
  it('moves cursor down by 1', () => {
    const s = createInitialState(['hello', 'world'])
    const s2 = processKey(s, 'j')
    expect(s2.cursor.row).toBe(1)
  })

  it('stops at last row', () => {
    const s = createInitialState(['hello', 'world'])
    const s2 = processKey({ ...s, cursor: { row: 1, col: 0 } }, 'j')
    expect(s2.cursor.row).toBe(1)
  })

  it('does nothing on single-line buffer', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, 'j')
    expect(s2.cursor.row).toBe(0)
  })

  it('clamps column to shorter line length', () => {
    const s = createInitialState(['hello world', 'hi'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 8 } }, 'j')
    expect(s2.cursor.row).toBe(1)
    expect(s2.cursor.col).toBe(1) // 'hi' has length 2, last col is 1
  })

  it('preserves column when next line is longer', () => {
    const s = createInitialState(['hi', 'hello world'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 1 } }, 'j')
    expect(s2.cursor.row).toBe(1)
    expect(s2.cursor.col).toBe(1)
  })
})

describe('k — move up', () => {
  it('moves cursor up by 1', () => {
    const s = createInitialState(['hello', 'world'])
    const s2 = processKey({ ...s, cursor: { row: 1, col: 0 } }, 'k')
    expect(s2.cursor.row).toBe(0)
  })

  it('stops at row 0', () => {
    const s = createInitialState(['hello', 'world'])
    const s2 = processKey(s, 'k')
    expect(s2.cursor.row).toBe(0)
  })

  it('does nothing on single-line buffer', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 2 } }, 'k')
    expect(s2.cursor.row).toBe(0)
  })
})

describe('3×3 grid exhaustive tests', () => {
  const grid = ['abc', 'def', 'ghi']

  it('h from (0,2) → (0,1)', () => {
    const s = createInitialState(grid)
    expect(processKey({ ...s, cursor: { row: 0, col: 2 } }, 'h').cursor).toEqual({ row: 0, col: 1 })
  })
  it('l from (1,1) → (1,2)', () => {
    const s = createInitialState(grid)
    expect(processKey({ ...s, cursor: { row: 1, col: 1 } }, 'l').cursor).toEqual({ row: 1, col: 2 })
  })
  it('j from (0,0) → (1,0)', () => {
    const s = createInitialState(grid)
    expect(processKey({ ...s, cursor: { row: 0, col: 0 } }, 'j').cursor).toEqual({ row: 1, col: 0 })
  })
  it('k from (2,2) → (1,2)', () => {
    const s = createInitialState(grid)
    expect(processKey({ ...s, cursor: { row: 2, col: 2 } }, 'k').cursor).toEqual({ row: 1, col: 2 })
  })
  it('h at col 0 stays', () => {
    const s = createInitialState(grid)
    expect(processKey({ ...s, cursor: { row: 1, col: 0 } }, 'h').cursor.col).toBe(0)
  })
  it('l at last col stays', () => {
    const s = createInitialState(grid)
    expect(processKey({ ...s, cursor: { row: 1, col: 2 } }, 'l').cursor.col).toBe(2)
  })
  it('j at last row stays', () => {
    const s = createInitialState(grid)
    expect(processKey({ ...s, cursor: { row: 2, col: 1 } }, 'j').cursor.row).toBe(2)
  })
  it('k at row 0 stays', () => {
    const s = createInitialState(grid)
    expect(processKey({ ...s, cursor: { row: 0, col: 1 } }, 'k').cursor.row).toBe(0)
  })
  it('unknown key returns state unchanged', () => {
    const s = createInitialState(grid)
    const s2 = processKey({ ...s, cursor: { row: 1, col: 1 } }, 'z')
    expect(s2.cursor).toEqual({ row: 1, col: 1 })
  })
})

// --- SPEC-008 word motion tests ---

describe('w — move to start of next word', () => {
  it('moves to start of next word on same line', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey(s, 'w')
    expect(s2.cursor.col).toBe(6) // 'w' of 'world'
  })

  it('stops at last word on line (stays at last char)', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 6 } }, 'w')
    // at 'world', w moves to end of buffer or next line start
    // single line: stays at last char col 10
    expect(s2.cursor.col).toBe(10)
  })

  it('w from last word on line moves to first word on next line', () => {
    const s = createInitialState(['hello', 'world'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 0 } }, 'w')
    expect(s2.cursor).toEqual({ row: 1, col: 0 })
  })

  it('w at end of buffer stays put', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 4 } }, 'w')
    expect(s2.cursor).toEqual({ row: 0, col: 4 })
  })

  it('w skips punctuation in "foo.bar"', () => {
    const s = createInitialState(['foo.bar'])
    // cursor at 0 ('f'), w should move to 3 ('.') or 4 ('b') depending on word definition
    // Vim word: non-whitespace run; 'foo' is one word, '.bar' starts at '.'
    const s2 = processKey(s, 'w')
    expect(s2.cursor.col).toBe(3) // moves to '.'
  })

  it('handles multiple spaces between words', () => {
    const s = createInitialState(['foo   bar'])
    const s2 = processKey(s, 'w')
    expect(s2.cursor.col).toBe(6) // 'b' of 'bar'
  })

  it('w on empty line moves to next line', () => {
    const s = createInitialState(['', 'hello'])
    const s2 = processKey(s, 'w')
    expect(s2.cursor).toEqual({ row: 1, col: 0 })
  })
})

describe('b — move to start of current/previous word', () => {
  it('moves to start of current word when in middle', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 8 } }, 'b') // cursor in 'world'
    expect(s2.cursor.col).toBe(6) // start of 'world'
  })

  it('moves to start of previous word when at word start', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 6 } }, 'b') // cursor at 'w'
    expect(s2.cursor.col).toBe(0) // start of 'hello'
  })

  it('b at first word on line moves to last word on previous line', () => {
    const s = createInitialState(['hello', 'world'])
    const s2 = processKey({ ...s, cursor: { row: 1, col: 0 } }, 'b')
    expect(s2.cursor).toEqual({ row: 0, col: 0 })
  })

  it('b at start of buffer stays put', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, 'b')
    expect(s2.cursor).toEqual({ row: 0, col: 0 })
  })
})

describe('e — move to end of current/next word', () => {
  it('moves to end of current word', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey(s, 'e') // cursor at 'h'
    expect(s2.cursor.col).toBe(4) // 'o' of 'hello'
  })

  it('moves to end of next word when at end of current', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 4 } }, 'e') // at end of 'hello'
    expect(s2.cursor.col).toBe(10) // 'd' of 'world'
  })

  it('e at end of buffer stays put', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 4 } }, 'e')
    expect(s2.cursor).toEqual({ row: 0, col: 4 })
  })
})
