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

// --- SPEC-009 line/file motion tests ---

describe('0 — move to column 0', () => {
  it('moves to col 0 from any position', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 7 } }, '0')
    expect(s2.cursor.col).toBe(0)
  })

  it('stays at col 0 when already there', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, '0')
    expect(s2.cursor.col).toBe(0)
  })
})

describe('^ — move to first non-whitespace character', () => {
  it('moves to first non-whitespace on indented line', () => {
    const s = createInitialState(['   hello'])
    const s2 = processKey(s, '^')
    expect(s2.cursor.col).toBe(3)
  })

  it('moves to col 0 on line with no leading spaces', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, '^')
    expect(s2.cursor.col).toBe(0)
  })

  it('moves to col 0 on empty line', () => {
    const s = createInitialState([''])
    const s2 = processKey(s, '^')
    expect(s2.cursor.col).toBe(0)
  })

  it('handles tab indentation (tab is whitespace)', () => {
    const s = createInitialState(['\t\thello'])
    const s2 = processKey(s, '^')
    expect(s2.cursor.col).toBe(2)
  })
})

describe('$ — move to last character on line', () => {
  it('moves to last char of line', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, '$')
    expect(s2.cursor.col).toBe(4)
  })

  it('stays at col 0 on empty line', () => {
    const s = createInitialState([''])
    const s2 = processKey(s, '$')
    expect(s2.cursor.col).toBe(0)
  })

  it('moves to last char from beginning of line', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey(s, '$')
    expect(s2.cursor.col).toBe(10)
  })
})

describe('gg — move to row 0, col 0', () => {
  it('moves to beginning of buffer from any position', () => {
    const s = createInitialState(['line1', 'line2', 'line3'])
    const s2 = processKey({ ...s, cursor: { row: 2, col: 3 } }, 'g')
    // 'g' alone is pending — needs second 'g'
    const s3 = processKey(s2, 'g')
    expect(s3.cursor).toEqual({ row: 0, col: 0 })
  })

  it('pressing g alone does not move cursor', () => {
    const s = createInitialState(['hello', 'world'])
    const s2 = processKey({ ...s, cursor: { row: 1, col: 2 } }, 'g')
    expect(s2.cursor).toEqual({ row: 1, col: 2 }) // cursor unchanged, but pending 'g'
  })
})

describe('G — move to last row, col 0', () => {
  it('moves to last row from any position', () => {
    const s = createInitialState(['line1', 'line2', 'line3'])
    const s2 = processKey(s, 'G')
    expect(s2.cursor).toEqual({ row: 2, col: 0 })
  })

  it('stays at row 0 on single-line buffer', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, 'G')
    expect(s2.cursor).toEqual({ row: 0, col: 0 })
  })

  it('G on multi-line moves to last row', () => {
    const s = createInitialState(['a', 'b', 'c', 'd'])
    const s2 = processKey(s, 'G')
    expect(s2.cursor.row).toBe(3)
  })
})
