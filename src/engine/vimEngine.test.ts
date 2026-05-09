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
    const s3 = processKey(s2, 'g')
    expect(s3.cursor).toEqual({ row: 0, col: 0 })
  })

  it('pressing g alone does not move cursor', () => {
    const s = createInitialState(['hello', 'world'])
    const s2 = processKey({ ...s, cursor: { row: 1, col: 2 } }, 'g')
    expect(s2.cursor).toEqual({ row: 1, col: 2 })
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

// --- SPEC-010 count modifier tests ---

describe('count modifiers', () => {
  it('3l moves right 3 columns', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, '3')
    const s2 = processKey(s1, 'l')
    expect(s2.cursor.col).toBe(3)
  })

  it('3l stops at line end if line is shorter', () => {
    const s = createInitialState(['hi'])
    const s1 = processKey(s, '3')
    const s2 = processKey(s1, 'l')
    expect(s2.cursor.col).toBe(1) // 'hi' last col is 1
  })

  it('5j moves down 5 rows', () => {
    const s = createInitialState(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
    const s1 = processKey(s, '5')
    const s2 = processKey(s1, 'j')
    expect(s2.cursor.row).toBe(5)
  })

  it('5j stops at last row if buffer has fewer rows', () => {
    const s = createInitialState(['a', 'b', 'c'])
    const s1 = processKey(s, '5')
    const s2 = processKey(s1, 'j')
    expect(s2.cursor.row).toBe(2)
  })

  it('2w moves forward 2 words', () => {
    const s = createInitialState(['hello world foo'])
    const s1 = processKey(s, '2')
    const s2 = processKey(s1, 'w')
    expect(s2.cursor.col).toBe(12) // 'f' of 'foo'
  })

  it('single digit 1l works same as l', () => {
    const s = createInitialState(['hello'])
    const s1 = processKey(s, '1')
    const s2 = processKey(s1, 'l')
    expect(s2.cursor.col).toBe(1)
  })

  it('count resets after each motion', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, '3')
    const s2 = processKey(s1, 'l') // moves 3 right — count cleared
    const s3 = processKey(s2, 'l') // moves 1 right (no count)
    expect(s3.cursor.col).toBe(4)
  })

  it('multi-digit count: 12 accumulates correctly', () => {
    const s = createInitialState(['hello world foo bar baz qux'])
    const s1 = processKey(s, '1')
    const s2 = processKey(s1, '2')
    // pendingCount should be 12 now
    const s3 = processKey(s2, 'l')
    expect(s3.cursor.col).toBe(12)
  })

  it('0 when no pendingCount is the col-0 motion', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 3 } }, '0')
    expect(s2.cursor.col).toBe(0)
  })

  it('0 after digit becomes part of count (10)', () => {
    const s = createInitialState(['hello world foo bar'])
    const s1 = processKey(s, '1')
    const s2 = processKey(s1, '0')
    // pendingCount is 10, not col-0 motion
    expect(s2.cursor.col).toBe(0) // cursor hasn't moved yet
    expect(s2.pendingCount).toBe(10)
  })

  it('10G moves to row 10 (or last row if fewer)', () => {
    const lines = Array.from({ length: 15 }, (_, i) => `line ${i}`)
    const s = createInitialState(lines)
    const s1 = processKey(s, '1')
    const s2 = processKey(s1, '0')
    const s3 = processKey(s2, 'G')
    // G with count N moves to row N-1 (1-indexed in Vim)
    expect(s3.cursor.row).toBe(9) // 10th row = index 9
  })
})

// --- SPEC-011 find motion tests ---

describe('f — find char forward on line', () => {
  it('moves to next occurrence of char', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, 'f')
    const s2 = processKey(s1, 'o')
    expect(s2.cursor.col).toBe(4) // 'o' in 'hello'
  })

  it('no match — cursor does not move', () => {
    const s = createInitialState(['hello'])
    const s1 = processKey(s, 'f')
    const s2 = processKey(s1, 'z')
    expect(s2.cursor.col).toBe(0)
  })

  it('stores lastFindChar and direction in state', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, 'f')
    const s2 = processKey(s1, 'o')
    expect(s2.lastFindChar).toBe('o')
    expect(s2.lastFindDirection).toBe('forward')
    expect(s2.lastFindTill).toBe(false)
  })

  it('finds second occurrence with count 2 via ; repeat', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, 'f')
    const s2 = processKey(s1, 'l')  // lands on col 2
    const s3 = processKey(s2, ';')  // repeats — lands on col 3
    expect(s3.cursor.col).toBe(3)
  })
})

describe('F — find char backward on line', () => {
  it('moves to previous occurrence of char', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey({ ...s, cursor: { row: 0, col: 10 } }, 'F')
    const s2 = processKey(s1, 'o')
    expect(s2.cursor.col).toBe(7) // 'o' in 'world'
  })

  it('stores backward direction', () => {
    const s = createInitialState(['hello'])
    const s1 = processKey({ ...s, cursor: { row: 0, col: 4 } }, 'F')
    const s2 = processKey(s1, 'e')
    expect(s2.lastFindDirection).toBe('backward')
  })
})

describe('t — find char forward, land one before', () => {
  it('lands one before the found char', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, 't')
    const s2 = processKey(s1, 'o')
    expect(s2.cursor.col).toBe(3) // one before 'o' at col 4
  })

  it('stores lastFindTill as true', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, 't')
    const s2 = processKey(s1, 'o')
    expect(s2.lastFindTill).toBe(true)
  })
})

describe('T — find char backward, land one after', () => {
  it('lands one after the found char', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey({ ...s, cursor: { row: 0, col: 10 } }, 'T')
    const s2 = processKey(s1, 'o')
    expect(s2.cursor.col).toBe(8) // one after 'o' at col 7
  })
})

describe('; — repeat last find', () => {
  it('repeats last f find in same direction', () => {
    const s = createInitialState(['abcabc'])
    const s1 = processKey(s, 'f')
    const s2 = processKey(s1, 'b')  // col 1
    const s3 = processKey(s2, ';')  // col 4 (second 'b')
    expect(s3.cursor.col).toBe(4)
  })

  it('does nothing when no last find', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, ';')
    expect(s2.cursor.col).toBe(0)
  })
})

describe(', — repeat last find in opposite direction', () => {
  it('reverses last f find direction', () => {
    const s = createInitialState(['abcabc'])
    const s1 = processKey(s, 'f')
    const s2 = processKey(s1, 'b') // col 1
    const s3 = processKey(s2, ';') // col 4
    const s4 = processKey(s3, ',') // back to col 1
    expect(s4.cursor.col).toBe(1)
  })
})
