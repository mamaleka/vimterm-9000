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

// --- SPEC-012 search motion tests ---

describe('/ — forward search', () => {
  it('entering / starts accumulating search pattern in pendingMotion', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, '/')
    expect(s1.pendingMotion[0]).toBe('/')
  })

  it('typing chars after / accumulates in pendingMotion', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, '/')
    const s2 = processKey(s1, 'w')
    const s3 = processKey(s2, 'o')
    expect(s3.pendingMotion).toEqual(['/', 'w', 'o'])
  })

  it('Enter executes search and moves cursor to first match', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, '/')
    const s2 = processKey(s1, 'w')
    const s3 = processKey(s2, 'o')
    const s4 = processKey(s3, 'Enter')
    expect(s4.cursor.col).toBe(6) // 'w' of 'world'
    expect(s4.searchPattern).toBe('wo')
    expect(s4.pendingMotion).toEqual([])
  })

  it('sets searchPattern after Enter', () => {
    const s = createInitialState(['foo bar baz'])
    const s1 = processKey(s, '/')
    const s2 = processKey(s1, 'b')
    const s3 = processKey(s2, 'a')
    const s4 = processKey(s3, 'Enter')
    expect(s4.searchPattern).toBe('ba')
  })

  it('no match: cursor does not move', () => {
    const s = createInitialState(['hello'])
    const s1 = processKey(s, '/')
    const s2 = processKey(s1, 'z')
    const s3 = processKey(s2, 'z')
    const s4 = processKey(s3, 'Enter')
    expect(s4.cursor.col).toBe(0)
  })

  it('search wraps around from end to beginning', () => {
    const s = createInitialState(['foo bar foo'])
    const positioned = { ...s, cursor: { row: 0, col: 8 } } // cursor at second 'foo'
    const s1 = processKey(positioned, '/')
    const s2 = processKey(s1, 'f')
    const s3 = processKey(s2, 'o')
    const s4 = processKey(s3, 'o')
    const s5 = processKey(s4, 'Enter')
    expect(s5.cursor.col).toBe(0) // wraps to first 'foo'
  })
})

describe('? — backward search', () => {
  it('? starts backward search accumulation', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, '?')
    expect(s1.pendingMotion[0]).toBe('?')
  })

  it('Enter executes backward search', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey({ ...s, cursor: { row: 0, col: 10 } }, '?')
    const s2 = processKey(s1, 'h')
    const s3 = processKey(s2, 'e')
    const s4 = processKey(s3, 'Enter')
    expect(s4.cursor.col).toBe(0) // finds 'he' backward
  })
})

describe('n — repeat search forward', () => {
  it('moves to next match after n', () => {
    const s = createInitialState(['foo bar foo'])
    const positioned = { ...s, cursor: { row: 0, col: 4 } }
    const s1 = processKey(positioned, '/')
    const s2 = processKey(s1, 'f')
    const s3 = processKey(s2, 'o')
    const s4 = processKey(s3, 'o')
    const s5 = processKey(s4, 'Enter') // lands at col 8 (second 'foo')
    const s6 = processKey(s5, 'n') // wraps to first 'foo' at col 0
    expect(s6.cursor.col).toBe(0)
  })

  it('does nothing when searchPattern is null', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, 'n')
    expect(s2.cursor.col).toBe(0)
  })
})

describe('N — repeat search backward', () => {
  it('N moves to previous match', () => {
    const s = createInitialState(['foo bar foo'])
    const s1 = processKey({ ...s, cursor: { row: 0, col: 8 } }, '/')
    const s2 = processKey(s1, 'f')
    const s3 = processKey(s2, 'o')
    const s4 = processKey(s3, 'o')
    const s5 = processKey(s4, 'Enter') // wraps to col 0
    const s6 = processKey(s5, 'N') // N = backward, goes back to col 8
    expect(s6.cursor.col).toBe(8)
  })
})

// --- SPEC-031 operator motion tests ---

describe('d operator — delete', () => {
  describe('dw — delete to end of word', () => {
    it('dw deletes from cursor to start of next word', () => {
      const s = createInitialState(['hello world'])
      // Press 'd' then 'w' — deletes 'hello ' leaving 'world'
      const s1 = processKey(s, 'd')
      const s2 = processKey(s1, 'w')
      expect(s2.buffer[0]).toBe('world')
      expect(s2.cursor).toEqual({ row: 0, col: 0 })
    })

    it('dw in middle of word deletes remainder of word and space', () => {
      const s = createInitialState(['hello world'])
      const s1 = processKey({ ...s, cursor: { row: 0, col: 2 } }, 'd')
      const s2 = processKey(s1, 'w')
      // From col 2 ('l') to start of 'world' (col 6): delete 'llo '
      // Result: 'he' + 'world' = 'heworld'
      expect(s2.buffer[0]).toBe('heworld')
    })

    it('dw at last word on last line deletes to end of line', () => {
      const s = createInitialState(['hello world'])
      const s1 = processKey({ ...s, cursor: { row: 0, col: 6 } }, 'd')
      const s2 = processKey(s1, 'w')
      // Deletes 'world' leaving 'hello '
      expect(s2.buffer[0]).toBe('hello ')
    })

    it('dw does not move to insert mode', () => {
      const s = createInitialState(['hello world'])
      const s1 = processKey(s, 'd')
      const s2 = processKey(s1, 'w')
      expect(s2.mode).toBe('normal')
    })
  })

  describe('dd — delete entire line', () => {
    it('dd deletes the current line from a multi-line buffer', () => {
      const s = createInitialState(['line1', 'line2', 'line3'])
      const s1 = processKey(s, 'd')
      const s2 = processKey(s1, 'd')
      expect(s2.buffer).toEqual(['line2', 'line3'])
      expect(s2.cursor.row).toBe(0)
    })

    it('dd on last line makes the line empty (or removes it if not the only line)', () => {
      const s = createInitialState(['line1', 'line2'])
      const s1 = processKey({ ...s, cursor: { row: 1, col: 0 } }, 'd')
      const s2 = processKey(s1, 'd')
      // Deleting the last line in a multi-line buffer removes it
      expect(s2.buffer).toEqual(['line1'])
      expect(s2.cursor.row).toBe(0)
    })

    it('dd on only line makes buffer contain one empty line', () => {
      const s = createInitialState(['hello'])
      const s1 = processKey(s, 'd')
      const s2 = processKey(s1, 'd')
      expect(s2.buffer).toEqual([''])
      expect(s2.cursor).toEqual({ row: 0, col: 0 })
    })

    it('dd yanks deleted line into register', () => {
      const s = createInitialState(['line1', 'line2'])
      const s1 = processKey(s, 'd')
      const s2 = processKey(s1, 'd')
      expect(s2.register).toBe('line1')
    })

    it('dd stays in normal mode', () => {
      const s = createInitialState(['hello', 'world'])
      const s1 = processKey(s, 'd')
      const s2 = processKey(s1, 'd')
      expect(s2.mode).toBe('normal')
    })
  })

  describe('d$ — delete to end of line', () => {
    it('d$ deletes from cursor to end of line', () => {
      const s = createInitialState(['hello world'])
      const s1 = processKey({ ...s, cursor: { row: 0, col: 5 } }, 'd')
      const s2 = processKey(s1, '$')
      expect(s2.buffer[0]).toBe('hello')
      expect(s2.cursor).toEqual({ row: 0, col: 4 })
    })

    it('d$ from col 0 deletes entire line content, leaving empty string', () => {
      const s = createInitialState(['hello'])
      const s1 = processKey(s, 'd')
      const s2 = processKey(s1, '$')
      expect(s2.buffer[0]).toBe('')
    })
  })

  describe('d3w — delete with count', () => {
    it('d3w deletes 3 words', () => {
      const s = createInitialState(['one two three four'])
      const s1 = processKey(s, 'd')
      const s2 = processKey(s1, '3')
      const s3 = processKey(s2, 'w')
      // Delete 'one two three ' leaving 'four'
      expect(s3.buffer[0]).toBe('four')
    })
  })
})

describe('c operator — change', () => {
  describe('cw — change word', () => {
    it('cw deletes word and enters insert mode', () => {
      const s = createInitialState(['hello world'])
      const s1 = processKey(s, 'c')
      const s2 = processKey(s1, 'w')
      // cw = ce in Vim: deletes to end of word only, NOT trailing whitespace
      expect(s2.buffer[0]).toBe(' world')
      expect(s2.mode).toBe('insert')
    })

    it('cw cursor is at the start of what was deleted', () => {
      const s = createInitialState(['hello world'])
      const s1 = processKey(s, 'c')
      const s2 = processKey(s1, 'w')
      expect(s2.cursor).toEqual({ row: 0, col: 0 })
    })
  })
})

describe('y operator — yank', () => {
  describe('yy — yank line', () => {
    it('yy yanks current line into register', () => {
      const s = createInitialState(['hello', 'world'])
      const s1 = processKey(s, 'y')
      const s2 = processKey(s1, 'y')
      expect(s2.register).toBe('hello')
    })

    it('yy does not change the buffer', () => {
      const s = createInitialState(['hello', 'world'])
      const s1 = processKey(s, 'y')
      const s2 = processKey(s1, 'y')
      expect(s2.buffer).toEqual(['hello', 'world'])
    })

    it('yy does not change the cursor', () => {
      const s = createInitialState(['hello', 'world'])
      const positioned = { ...s, cursor: { row: 1, col: 2 } }
      const s1 = processKey(positioned, 'y')
      const s2 = processKey(s1, 'y')
      expect(s2.cursor).toEqual({ row: 1, col: 2 })
    })

    it('yy stays in normal mode', () => {
      const s = createInitialState(['hello'])
      const s1 = processKey(s, 'y')
      const s2 = processKey(s1, 'y')
      expect(s2.mode).toBe('normal')
    })
  })
})

describe('p — paste after cursor', () => {
  it('p pastes register content after cursor (charwise)', () => {
    const s = createInitialState(['hello world'])
    // Yank then paste
    const withRegister = { ...s, register: 'XYZ', registerType: 'char' as const }
    const s1 = processKey(withRegister, 'p')
    // Pastes 'XYZ' after cursor (col 0), result: 'hXYZello world'
    expect(s1.buffer[0]).toBe('hXYZello world')
    expect(s1.cursor.col).toBe(3) // cursor on last char of pasted text
  })

  it('p with linewise register pastes line below current line', () => {
    const s = createInitialState(['hello', 'world'])
    const withRegister = { ...s, register: 'inserted', registerType: 'line' as const }
    const s1 = processKey(withRegister, 'p')
    expect(s1.buffer).toEqual(['hello', 'inserted', 'world'])
    expect(s1.cursor.row).toBe(1)
  })

  it('p pastes after doing dd (linewise)', () => {
    const s = createInitialState(['line1', 'line2', 'line3'])
    // dd deletes line1, stores in register linewise
    const s1 = processKey(s, 'd')
    const s2 = processKey(s1, 'd')
    // Now paste it back below current line (line2)
    const s3 = processKey(s2, 'p')
    expect(s3.buffer).toEqual(['line2', 'line1', 'line3'])
  })
})

describe('P — paste before cursor', () => {
  it('P pastes register content before cursor (charwise)', () => {
    const s = createInitialState(['hello'])
    const withRegister = { ...s, cursor: { row: 0, col: 2 }, register: 'XYZ', registerType: 'char' as const }
    const s1 = processKey(withRegister, 'P')
    // Pastes 'XYZ' before col 2 ('l'), result: 'heXYZllo'
    expect(s1.buffer[0]).toBe('heXYZllo')
    expect(s1.cursor.col).toBe(4) // cursor on last char of pasted text
  })

  it('P with linewise register pastes line above current line', () => {
    const s = createInitialState(['hello', 'world'])
    const withRegister = { ...s, cursor: { row: 1, col: 0 }, register: 'inserted', registerType: 'line' as const }
    const s1 = processKey(withRegister, 'P')
    expect(s1.buffer).toEqual(['hello', 'inserted', 'world'])
    expect(s1.cursor.row).toBe(1)
  })
})

describe('. — dot repeat', () => {
  it('. repeats last delete operation (dw)', () => {
    const s = createInitialState(['one two three'])
    // Do dw once
    const s1 = processKey(s, 'd')
    const s2 = processKey(s1, 'w')
    // Now buffer is 'two three', cursor at 0
    expect(s2.buffer[0]).toBe('two three')
    // Dot repeat: another dw
    const s3 = processKey(s2, '.')
    expect(s3.buffer[0]).toBe('three')
  })

  it('. repeats last dd operation', () => {
    const s = createInitialState(['line1', 'line2', 'line3'])
    const s1 = processKey(s, 'd')
    const s2 = processKey(s1, 'd')
    expect(s2.buffer).toEqual(['line2', 'line3'])
    const s3 = processKey(s2, '.')
    expect(s3.buffer).toEqual(['line3'])
  })

  it('. stores lastAction after dw', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, 'd')
    const s2 = processKey(s1, 'w')
    expect(s2.lastAction).not.toBeNull()
    expect(s2.lastAction?.operator).toBe('d')
    expect(s2.lastAction?.motion).toBe('w')
  })

  it('. does nothing when lastAction is null', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey(s, '.')
    expect(s2.cursor).toEqual(s.cursor)
    expect(s2.buffer).toEqual(s.buffer)
  })

  it('. repeats cw + typed text after Escape', () => {
    const s = createInitialState(['hello world', 'hello world'])
    // cw
    const s1 = processKey(s, 'c')
    const s2 = processKey(s1, 'w')
    expect(s2.mode).toBe('insert')
    // Type 'bye'
    const s3 = processKey(s2, 'b')
    const s4 = processKey(s3, 'y')
    const s5 = processKey(s4, 'e')
    // Escape — cursor will be at col 2 (last char of 'bye')
    const s6 = processKey(s5, 'Escape')
    expect(s6.mode).toBe('normal')
    expect(s6.buffer[0]).toBe('bye world')
    // Move to next line, go to col 0, then dot-repeat
    const s7 = processKey(s6, 'j')
    const s8 = processKey(s7, '0')
    const s9 = processKey(s8, '.')
    expect(s9.buffer[1]).toBe('bye world')
    expect(s9.mode).toBe('normal')
  })
})

describe('insert mode', () => {
  it('entering insert mode via cw allows typing characters', () => {
    const s = createInitialState(['hello'])
    const s1 = processKey(s, 'c')
    const s2 = processKey(s1, 'w')
    expect(s2.mode).toBe('insert')
    const s3 = processKey(s2, 'x')
    expect(s3.buffer[0]).toBe('x')
    expect(s3.cursor.col).toBe(1)
  })

  it('characters are inserted at cursor in insert mode', () => {
    const s = createInitialState(['world'])
    // Enter insert mode with cw (deletes 'world', enters insert)
    const s1 = processKey(s, 'c')
    const s2 = processKey(s1, 'w')
    // Type 'hi'
    const s3 = processKey(s2, 'h')
    const s4 = processKey(s3, 'i')
    expect(s4.buffer[0]).toBe('hi')
    expect(s4.cursor.col).toBe(2)
  })

  it('Escape in insert mode returns to normal mode', () => {
    const s = createInitialState(['hello'])
    const s1 = processKey(s, 'c')
    const s2 = processKey(s1, 'w')
    expect(s2.mode).toBe('insert')
    const s3 = processKey(s2, 'Escape')
    expect(s3.mode).toBe('normal')
  })

  it('Escape in insert mode positions cursor correctly (not past end of line)', () => {
    const s = createInitialState([''])
    const inInsert = { ...s, mode: 'insert' as const }
    const s1 = processKey(inInsert, 'a')
    const s2 = processKey(s1, 'b')
    const s3 = processKey(s2, 'c')
    const s4 = processKey(s3, 'Escape')
    expect(s4.mode).toBe('normal')
    // In normal mode, cursor can be on last char but not past it
    expect(s4.cursor.col).toBeLessThanOrEqual(s4.buffer[0]!.length - 1)
  })

  it('Backspace in insert mode deletes previous character', () => {
    const s = createInitialState([''])
    const inInsert = { ...s, mode: 'insert' as const }
    const s1 = processKey(inInsert, 'h')
    const s2 = processKey(s1, 'i')
    const s3 = processKey(s2, 'Backspace')
    expect(s3.buffer[0]).toBe('h')
    expect(s3.cursor.col).toBe(1)
  })
})

describe('no regressions — all prior motion tests work after operators added', () => {
  it('h still moves left', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey({ ...s, cursor: { row: 0, col: 3 } }, 'h')
    expect(s2.cursor.col).toBe(2)
  })

  it('w still moves to next word', () => {
    const s = createInitialState(['hello world'])
    const s2 = processKey(s, 'w')
    expect(s2.cursor.col).toBe(6)
  })

  it('count modifier still works with motions', () => {
    const s = createInitialState(['hello world'])
    const s1 = processKey(s, '3')
    const s2 = processKey(s1, 'l')
    expect(s2.cursor.col).toBe(3)
  })

  it('d in normal mode starts operator pending (does not move)', () => {
    const s = createInitialState(['hello'])
    const s2 = processKey(s, 'd')
    expect(s2.pendingOperator).toBe('d')
    expect(s2.cursor).toEqual(s.cursor)
  })
})
